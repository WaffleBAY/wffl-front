'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MiniKit } from '@worldcoin/minikit-js';
import type { Address } from 'viem';
import { waffleFactoryAbi } from '@/contracts/generated';
import { getWaffleFactoryAddress, CHAIN_ID } from '@/config/contracts';
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

interface TxStatusResponse {
  status: 'pending' | 'mining' | 'success' | 'reverted' | 'failed';
  txHash?: string;
  marketAddress?: string;
  error?: string;
}

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

  // Poll World Developer API directly (no server proxy needed)
  const pollForMarketAddress = useCallback(async (transactionId: string): Promise<Address | null> => {
    const appId = process.env.NEXT_PUBLIC_APP_ID;
    toast.info(`polling 시작: ${transactionId.slice(0, 8)}...`);

    // Step 1: Poll for real tx hash
    let realHash: string | null = null;

    for (let i = 0; i < 30; i++) {
      try {
        const url = `https://developer.worldcoin.org/api/v2/minikit/transaction/${transactionId}?app_id=${appId}&type=transaction`;
        const res = await fetch(url);
        const text = await res.text();

        if (i === 0 || i % 5 === 0) {
          toast.info(`[${i}] status=${res.status} body=${text.slice(0, 80)}`);
        }

        if (!res.ok) {
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }

        const data = JSON.parse(text);

        if (data.transactionStatus === 'failed') {
          toast.error('트랜잭션이 실패했습니다');
          return null;
        }

        if (data.transactionHash) {
          realHash = data.transactionHash;
          setTxHash(realHash as `0x${string}`);
          toast.info(`실제 TX: ${realHash!.slice(0, 10)}...`);
          break;
        }
      } catch (e) {
        toast.error(`poll 에러: ${e instanceof Error ? e.message : 'unknown'}`);
      }

      await new Promise((r) => setTimeout(r, 2000));
    }

    if (!realHash) {
      toast.error('트랜잭션 해시를 가져오지 못했습니다');
      return null;
    }

    // Step 2: Get receipt via server API route (RPC calls server-side)
    for (let i = 0; i < 20; i++) {
      try {
        const res = await fetch('/api/transaction/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId }),
        });
        const text = await res.text();

        if (i < 3 || i % 5 === 0) {
          toast.info(`[receipt ${i}] ${text.slice(0, 100)}`);
        }

        const data: TxStatusResponse & Record<string, unknown> = JSON.parse(text);

        if (data.status === 'success' && data.marketAddress) {
          return data.marketAddress as Address;
        }

        if (data.status === 'reverted' || data.status === 'failed') {
          toast.error(`TX ${data.status}: ${JSON.stringify(data).slice(0, 100)}`);
          return null;
        }
      } catch (e) {
        toast.error(`receipt poll 에러: ${e instanceof Error ? e.message : 'unknown'}`);
      }

      await new Promise((r) => setTimeout(r, 3000));
    }

    toast.error('마켓 주소를 가져올 수 없습니다');
    return null;
  }, []);

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

      // Get transaction_id (this is a relayer ID, NOT the on-chain hash)
      const transactionId = (finalPayload as { transaction_id: string }).transaction_id;
      setIsConfirming(true);
      setCurrentStep(STEPS.confirm);

      // Poll server-side API for real hash + receipt + market address
      const marketAddress = await pollForMarketAddress(transactionId);

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
