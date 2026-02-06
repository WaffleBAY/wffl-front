'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MiniKit } from '@worldcoin/minikit-js';
import { parseEventLogs, type Address, type Hex, createPublicClient, http } from 'viem';
import { waffleFactoryAbi } from '@/contracts/generated';
import { getWaffleFactoryAddress, CHAIN_ID } from '@/config/contracts';
import { worldChainSepolia } from '@/config/wagmi';
import { getLotteryRepository } from '../repository';
import { uploadImage } from '@/lib/api/uploads';
import { MarketType } from '../types';
import type { LotteryCreateFormData } from '../schemas/lotteryCreateSchema';

interface UseCreateLotteryReturn {
  isSubmitting: boolean;
  isPending: boolean;        // waiting for MiniKit response
  isConfirming: boolean;     // waiting for tx receipt
  txHash: `0x${string}` | undefined;
  submit: (data: LotteryCreateFormData) => Promise<void>;
}

// Create a public client for reading receipts
const publicClient = createPublicClient({
  chain: worldChainSepolia,
  transport: http(),
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

  // Ref to store pending form data for backend save
  const pendingDataRef = useRef<{
    formData: LotteryCreateFormData;
    imageUrl: string;
  } | null>(null);

  // Poll for transaction receipt and extract market address
  const waitForReceipt = useCallback(async (hash: `0x${string}`): Promise<Address | null> => {
    try {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 1,
      });

      // Parse MarketCreated event to get market address
      const logs = parseEventLogs({
        abi: waffleFactoryAbi,
        eventName: 'MarketCreated',
        logs: receipt.logs,
      });

      if (logs.length > 0) {
        return logs[0].args.marketAddress as Address;
      }
      return null;
    } catch (e) {
      console.error('Failed to get receipt:', e);
      return null;
    }
  }, []);

  // Save to backend after getting market address
  const saveToBackend = useCallback(async (marketAddress: Address) => {
    if (!pendingDataRef.current) return;

    const { formData, imageUrl } = pendingDataRef.current;

    try {
      const repository = getLotteryRepository();
      const createParams = convertFormToCreateParams(formData, imageUrl);

      const paramsWithContract = {
        ...createParams,
        contractAddress: marketAddress,
      };

      const lottery = await repository.create(paramsWithContract);

      toast.success('마켓이 생성되었습니다');
      router.push(`/lottery/${lottery.id}`);
    } catch (error) {
      toast.error('백엔드 저장에 실패했습니다. 컨트랙트는 생성되었습니다.');
      console.error('Backend save error:', error);
    } finally {
      pendingDataRef.current = null;
      setIsSubmitting(false);
      setIsConfirming(false);
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
      toast.info('이미지 업로드 중...');
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
      toast.info('트랜잭션 서명을 요청합니다...');

      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: getWaffleFactoryAddress(CHAIN_ID),
            abi: waffleFactoryAbi,
            functionName: 'createMarket',
            args: [
              mTypeNum,
              ticketPriceWei.toString(),
              goalAmountWei.toString(),
              data.winnerCount.toString(),
              durationSeconds.toString(),
            ],
            value: sellerDeposit.toString(),
          },
        ],
      });

      setIsPending(false);

      if (finalPayload.status === 'error') {
        const errorPayload = finalPayload as { error_code?: string };
        if (errorPayload.error_code === 'user_rejected') {
          throw new Error('트랜잭션이 취소되었습니다');
        }
        throw new Error('트랜잭션 전송에 실패했습니다');
      }

      // Get transaction hash from response
      const hash = (finalPayload as { transaction_id: string }).transaction_id as `0x${string}`;
      setTxHash(hash);
      setIsConfirming(true);
      toast.info('트랜잭션 확인 중...');

      // Wait for receipt and get market address
      const marketAddress = await waitForReceipt(hash);

      if (!marketAddress) {
        throw new Error('마켓 주소를 가져올 수 없습니다');
      }

      // Save to backend
      await saveToBackend(marketAddress);

    } catch (error) {
      const message = error instanceof Error ? error.message : '마켓 생성에 실패했습니다';
      toast.error(message);
      console.error('Create lottery error:', error);
      pendingDataRef.current = null;
      setIsSubmitting(false);
      setIsPending(false);
      setIsConfirming(false);
    }
  };

  return {
    isSubmitting,
    isPending,
    isConfirming,
    txHash,
    submit,
  };
}
