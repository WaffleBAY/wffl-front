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
  | { id: 'sign'; label: '트랜잭션 서명'; desc: '블록체인에 마켓을 등록합니다. World App에서 서명을 승인해주세요.' }
  | { id: 'confirm'; label: '트랜잭션 확인'; desc: '블록체인에서 트랜잭션을 처리하고 있습니다. 최대 2분 정도 소요될 수 있습니다.' }
  | { id: 'save'; label: '마켓 등록'; desc: '마켓 정보를 저장하고 있습니다' }
  | null;

const STEPS = {
  upload: { id: 'upload' as const, label: '이미지 업로드' as const, desc: '상품 이미지를 서버에 업로드하고 있습니다' as const },
  sign: { id: 'sign' as const, label: '트랜잭션 서명' as const, desc: '블록체인에 마켓을 등록합니다. World App에서 서명을 승인해주세요.' as const },
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
  status: 'pending' | 'mining' | 'success' | 'success_no_event' | 'reverted' | 'failed';
  txHash?: string;
  marketAddress?: string;
  error?: string;
  logCount?: number;
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

    // Step 2: Get receipt via server API route (pass txHash directly to skip re-polling World API)
    for (let i = 0; i < 20; i++) {
      try {
        const res = await fetch('/api/transaction/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId, txHash: realHash }),
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

        // Transaction confirmed but no MarketCreated event found — stop polling
        if (data.status === 'success_no_event') {
          toast.error(`TX 성공했지만 MarketCreated 이벤트를 찾을 수 없습니다. logs=${data.logCount}`);
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
      if (!MiniKit.isInstalled()) {
        throw new Error('World App에서 열어주세요');
      }

      // Step 1: Upload image
      setCurrentStep(STEPS.upload);
      const imageUrl = await uploadImage(data.imageFile);

      // Step 2: Calculate contract params
      setCurrentStep(STEPS.sign);

      const now = Date.now();
      const expiresAt = data.expiresAt.getTime();
      const durationSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));

      const ticketPriceWei = BigInt(Math.floor(data.entryPrice * 1e18));
      const goalAmountWei = BigInt(Math.floor(data.targetAmount * 1e18));

      // Contract requires 15% deposit for ALL market types
      const sellerDeposit = (goalAmountWei * BigInt(15)) / BigInt(100);
      const mTypeNum = data.marketType === MarketType.LOTTERY ? 0 : 1;

      pendingDataRef.current = { formData: data, imageUrl };

      // Step 3: Send transaction
      // World ID verification is commented out in contract, pass dummy values
      const contractAddr = getWaffleFactoryAddress(CHAIN_ID);
      const dummyProof = ['0', '0', '0', '0', '0', '0', '0', '0'];
      const txArgs = [
        '0',                           // root (dummy - verification disabled)
        '0',                           // sellerNullifierHash (dummy)
        dummyProof,                    // sellerProof uint256[8] (dummy)
        mTypeNum.toString(),           // mType (uint8)
        ticketPriceWei.toString(),     // ticketPrice (uint256)
        goalAmountWei.toString(),      // goalAmount (uint256)
        data.winnerCount.toString(),   // preparedQuantity (uint256)
        durationSeconds.toString(),    // duration (uint256)
      ];
      const txValue = '0x' + sellerDeposit.toString(16);

      setIsPending(true);

      let finalPayload;
      try {
        const result = await MiniKit.commandsAsync.sendTransaction({
          transaction: [
            {
              address: contractAddr,
              abi: waffleFactoryAbi as readonly object[],
              functionName: 'createMarket',
              args: txArgs,
              value: txValue,
            },
          ],
        });
        finalPayload = result.finalPayload;
      } catch (txError) {
        const msg = txError instanceof Error
          ? txError.message
          : typeof txError === 'object'
            ? JSON.stringify(txError, null, 0)
            : String(txError);
        throw new Error(`sendTx 예외: ${msg.slice(0, 200)}`);
      }

      setIsPending(false);

      if (finalPayload.status === 'error') {
        throw new Error(`TX 에러: ${JSON.stringify(finalPayload).slice(0, 200)}`);
      }

      // Get transaction_id (relayer ID, not on-chain hash)
      const transactionId = (finalPayload as { transaction_id: string }).transaction_id;
      setIsConfirming(true);
      setCurrentStep(STEPS.confirm);

      const marketAddress = await pollForMarketAddress(transactionId);

      if (!marketAddress) {
        throw new Error('마켓 주소를 가져올 수 없습니다');
      }

      await saveToBackend(marketAddress);

    } catch (error: unknown) {
      let message: string;
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'object' && error !== null) {
        message = JSON.stringify(error).slice(0, 300);
      } else {
        message = String(error);
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
