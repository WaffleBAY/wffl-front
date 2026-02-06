'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MiniKit } from '@worldcoin/minikit-js';
import { parseEventLogs, type Address, type Hex, createPublicClient, http, parseAbiItem } from 'viem';
import { waffleFactoryAbi } from '@/contracts/generated';
import { getWaffleFactoryAddress, CHAIN_ID } from '@/config/contracts';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { worldChainSepolia } from '@/config/wagmi';
import { getLotteryRepository } from '../repository';
import { uploadImage } from '@/lib/api/uploads';
import { MarketType } from '../types';
import type { LotteryCreateFormData } from '../schemas/lotteryCreateSchema';

export type CreateStep =
  | { id: 'upload'; label: '이미지 업로드'; desc: '상품 이미지를 서버에 업로드하고 있습니다' }
  | { id: 'sign'; label: '서명 요청'; desc: '블록체인에 마켓을 등록하려면 지갑 서명이 필요합니다. World App에서 서명을 승인해주세요.' }
  | { id: 'confirm'; label: '트랜잭션 확인'; desc: '블록체인에서 트랜잭션을 처리하고 있습니다. 최대 2분 정도 소요될 수 있습니다.' }
  | { id: 'save'; label: '마켓 등록'; desc: '마켓 정보를 저장하고 있습니다' }
  | null;

const STEPS = {
  upload: { id: 'upload' as const, label: '이미지 업로드' as const, desc: '상품 이미지를 서버에 업로드하고 있습니다' as const },
  sign: { id: 'sign' as const, label: '서명 요청' as const, desc: '블록체인에 마켓을 등록하려면 지갑 서명이 필요합니다. World App에서 서명을 승인해주세요.' as const },
  confirm: { id: 'confirm' as const, label: '트랜잭션 확인' as const, desc: '블록체인에서 트랜잭션을 처리하고 있습니다. 최대 2분 정도 소요될 수 있습니다.' as const },
  save: { id: 'save' as const, label: '마켓 등록' as const, desc: '마켓 정보를 저장하고 있습니다' as const },
};

interface UseCreateLotteryReturn {
  isSubmitting: boolean;
  isPending: boolean;
  isConfirming: boolean;
  txHash: `0x${string}` | undefined;
  currentStep: CreateStep;
  submit: (data: LotteryCreateFormData) => Promise<void>;
}

// Create a public client for reading receipts
const publicClient = createPublicClient({
  chain: worldChainSepolia,
  transport: http('https://worldchain-sepolia.g.alchemy.com/public'),
});

/**
 * Convert legacy form data to CreateMarketParams
 * This handles backward compatibility while form schema is being updated
 */
function convertFormToCreateParams(data: LotteryCreateFormData, imageUrl: string) {
  // Calculate duration in seconds from expiresAt
  const now = Date.now();
  const expiresAt = data.expiresAt.getTime();
  const durationSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));

  // Convert ETH amounts to wei (string)
  const ticketPriceWei = BigInt(Math.floor(data.entryPrice * 1e18)).toString();
  const goalAmountWei = BigInt(Math.floor(data.targetAmount * 1e18)).toString();

  return {
    marketType: data.marketType,
    ticketPrice: ticketPriceWei,
    goalAmount: goalAmountWei,
    preparedQuantity: data.winnerCount,
    duration: durationSeconds,
    title: data.title,
    description: data.description,
    imageUrl,
    prizeDescription: data.description,
    shippingRegions: data.shippingRegions,
  };
}

export function useCreateLottery(): UseCreateLotteryReturn {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [currentStep, setCurrentStep] = useState<CreateStep>(null);

  // Ref to store pending form data for backend save
  const pendingDataRef = useRef<{
    formData: LotteryCreateFormData;
    imageUrl: string;
  } | null>(null);

  // Fallback: query recent MarketCreated events from factory to find market address
  const findMarketFromLogs = useCallback(async (): Promise<Address | null> => {
    try {
      const walletAddress = useAuthStore.getState().walletAddress;
      if (!walletAddress) return null;

      const contractAddr = getWaffleFactoryAddress(CHAIN_ID);
      const currentBlock = await publicClient.getBlockNumber();
      // Look back ~500 blocks (~15 min on World Chain)
      const fromBlock = currentBlock > BigInt(500) ? currentBlock - BigInt(500) : BigInt(0);

      const logs = await publicClient.getLogs({
        address: contractAddr,
        event: parseAbiItem('event MarketCreated(uint256 indexed marketId, address indexed marketAddress, address indexed seller, uint8 mType)'),
        args: {
          seller: walletAddress as Address,
        },
        fromBlock,
        toBlock: 'latest',
      });

      if (logs.length > 0) {
        const latest = logs[logs.length - 1];
        return latest.args.marketAddress as Address;
      }
      return null;
    } catch (e) {
      console.error('Fallback log query failed:', e);
      return null;
    }
  }, []);

  // Poll for transaction receipt and extract market address
  const waitForReceipt = useCallback(async (hash: `0x${string}`): Promise<Address | null> => {
    // Try 1: waitForTransactionReceipt with shorter timeout
    try {
      toast.info(`TX: ${hash.slice(0, 10)}...${hash.slice(-6)}`);

      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 1,
        timeout: 30_000,        // 30 second timeout
        pollingInterval: 3_000,
      });

      if (receipt.status === 'reverted') {
        toast.error('트랜잭션이 revert 되었습니다');
        return null;
      }

      const logs = parseEventLogs({
        abi: waffleFactoryAbi,
        eventName: 'MarketCreated',
        logs: receipt.logs,
      });

      if (logs.length > 0) {
        return logs[0].args.marketAddress as Address;
      }
      return null;
    } catch {
      // Try 2: Fallback - query event logs directly
      toast.info('이벤트 로그에서 마켓 주소를 검색합니다...');

      // Poll up to 90 seconds with fallback method
      for (let i = 0; i < 15; i++) {
        const addr = await findMarketFromLogs();
        if (addr) return addr;
        await new Promise((r) => setTimeout(r, 6_000));
      }

      toast.error('마켓 주소를 찾을 수 없습니다. 잠시 후 다시 시도해주세요.');
      return null;
    }
  }, [findMarketFromLogs]);

  // Save to backend after getting market address
  const saveToBackend = useCallback(async (marketAddress: Address) => {
    if (!pendingDataRef.current) return;

    const { formData, imageUrl } = pendingDataRef.current;

    try {
      setCurrentStep(STEPS.save);
      const repository = getLotteryRepository();
      const createParams = convertFormToCreateParams(formData, imageUrl);

      const paramsWithContract = {
        ...createParams,
        contractAddress: marketAddress,
      };

      const lottery = await repository.create(paramsWithContract);

      toast.success('마켓이 생성되었습니다!');
      router.push(`/lottery/${lottery.id}`);
    } catch (error) {
      toast.error('백엔드 저장에 실패했습니다. 컨트랙트는 생성되었습니다.');
      console.error('Backend save error:', error);
    } finally {
      pendingDataRef.current = null;
      setIsSubmitting(false);
      setIsConfirming(false);
      setCurrentStep(null);
    }
  }, [router]);

  const submit = async (data: LotteryCreateFormData) => {
    setIsSubmitting(true);

    try {
      // Check MiniKit availability
      if (!MiniKit.isInstalled()) {
        throw new Error('World App에서 열어주세요');
      }

      // Step 1: Upload image to R2 via backend
      setCurrentStep(STEPS.upload);
      const imageUrl = await uploadImage(data.imageFile);

      // Step 2: Calculate contract params
      const now = Date.now();
      const expiresAt = data.expiresAt.getTime();
      const durationSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));

      // Convert ETH to wei
      const ticketPriceWei = BigInt(Math.floor(data.entryPrice * 1e18));
      const goalAmountWei = BigInt(Math.floor(data.targetAmount * 1e18));

      // Calculate seller deposit for RAFFLE (15% of goalAmount)
      const sellerDeposit = data.marketType === MarketType.RAFFLE
        ? (goalAmountWei * BigInt(15)) / BigInt(100)
        : BigInt(0);

      // Map marketType to contract enum (0 = LOTTERY, 1 = RAFFLE)
      const mTypeNum = data.marketType === MarketType.LOTTERY ? 0 : 1;

      // Store pending data for backend save after tx confirms
      pendingDataRef.current = { formData: data, imageUrl };

      // Step 3: Call contract via MiniKit sendTransaction
      setIsPending(true);
      setCurrentStep(STEPS.sign);

      // Format transaction like HAVO reference
      const contractAddr = getWaffleFactoryAddress(CHAIN_ID);
      const txArgs = [
        mTypeNum,
        ticketPriceWei.toString(),
        goalAmountWei.toString(),
        data.winnerCount,
        durationSeconds,
      ];
      const txValue = sellerDeposit > BigInt(0)
        ? '0x' + sellerDeposit.toString(16)
        : undefined;

      let finalPayload;
      try {
        const result = await MiniKit.commandsAsync.sendTransaction({
          transaction: [
            {
              address: contractAddr,
              abi: waffleFactoryAbi as readonly object[],
              functionName: 'createMarket',
              args: txArgs,
              ...(txValue ? { value: txValue } : {}),
            },
          ],
        });
        finalPayload = result.finalPayload;
      } catch (txError) {
        throw new Error(`sendTransaction 예외: ${txError instanceof Error ? txError.message : JSON.stringify(txError)}`);
      }

      setIsPending(false);

      if (finalPayload.status === 'error') {
        const errorPayload = finalPayload as { error_code?: string; details?: string };
        throw new Error(`TX 에러: ${errorPayload.error_code || 'unknown'} ${errorPayload.details || JSON.stringify(finalPayload)}`);
      }

      // Get transaction hash from response
      const hash = (finalPayload as { transaction_id: string }).transaction_id as `0x${string}`;
      setTxHash(hash);
      setIsConfirming(true);
      setCurrentStep(STEPS.confirm);

      // Wait for receipt and get market address
      const marketAddress = await waitForReceipt(hash);

      if (!marketAddress) {
        throw new Error('마켓 주소를 가져올 수 없습니다');
      }

      // Save to backend
      await saveToBackend(marketAddress);

    } catch (error: unknown) {
      let message = '마켓 생성에 실패했습니다';
      if (error instanceof Error) {
        message = error.message;
      }
      // Show detailed error for debugging
      const axiosErr = error as { response?: { status?: number; data?: unknown } };
      if (axiosErr?.response) {
        message = `[${axiosErr.response.status}] ${JSON.stringify(axiosErr.response.data)}`;
      }
      toast.error(message);
      console.error('Create lottery error:', error);
      pendingDataRef.current = null;
      setIsSubmitting(false);
      setIsPending(false);
      setIsConfirming(false);
      setCurrentStep(null);
    }
  };

  return {
    isSubmitting,
    isPending,
    isConfirming,
    txHash,
    currentStep,
    submit,
  };
}
