'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useWaitForTransactionReceipt } from 'wagmi';
import { parseEventLogs, type Address } from 'viem';
import {
  useWriteWaffleFactoryCreateMarket,
  waffleFactoryAbi,
} from '@/contracts/generated';
import { getWaffleFactoryAddress, CHAIN_ID } from '@/config/contracts';
import { getLotteryRepository } from '../repository';
import { uploadImage } from '@/lib/api/uploads';
import { MarketType } from '../types';
import type { LotteryCreateFormData } from '../schemas/lotteryCreateSchema';

interface UseCreateLotteryReturn {
  isSubmitting: boolean;
  isPending: boolean;        // contract write pending
  isConfirming: boolean;     // waiting for tx receipt
  txHash: `0x${string}` | undefined;
  submit: (data: LotteryCreateFormData) => Promise<void>;
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
  // entryPrice and targetAmount are in WLD/ETH, need to convert to wei
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
    prizeDescription: data.description, // Use description as prize description for now
    shippingRegions: data.shippingRegions,
  };
}

export function useCreateLottery(): UseCreateLotteryReturn {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Contract write hook with error state
  const {
    data: txHash,
    isPending,
    writeContract,
    reset: resetWrite,
    error: writeError,
  } = useWriteWaffleFactoryCreateMarket();

  // Transaction receipt waiting with error state
  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isTxSuccess,
    isError: isTxError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  // Extract market address from receipt
  const marketAddress = useMemo(() => {
    if (!receipt) return null;
    try {
      const logs = parseEventLogs({
        abi: waffleFactoryAbi,
        eventName: 'MarketCreated',
        logs: receipt.logs,
      });
      if (logs.length > 0) {
        return logs[0].args.marketAddress as Address;
      }
    } catch (e) {
      console.error('Failed to parse MarketCreated event:', e);
    }
    return null;
  }, [receipt]);

  // Ref to store pending form data for backend save
  const pendingDataRef = useRef<{
    formData: LotteryCreateFormData;
    imageUrl: string;
  } | null>(null);

  // Effect to handle write errors (wallet rejection, etc.)
  useEffect(() => {
    if (writeError) {
      const errorMessage = writeError.message.includes('User rejected')
        ? '트랜잭션이 취소되었습니다'
        : '트랜잭션 전송에 실패했습니다';
      toast.error(errorMessage);
      pendingDataRef.current = null;
      resetWrite();
      setIsSubmitting(false);
    }
  }, [writeError, resetWrite]);

  // Effect to handle transaction errors (on-chain failure)
  useEffect(() => {
    if (isTxError) {
      toast.error('트랜잭션이 실패했습니다');
      pendingDataRef.current = null;
      resetWrite();
      setIsSubmitting(false);
    }
  }, [isTxError, resetWrite]);

  // Effect to save to backend after tx success
  useEffect(() => {
    const saveToBackend = async () => {
      if (!isTxSuccess || !marketAddress || !pendingDataRef.current) return;

      const { formData, imageUrl } = pendingDataRef.current;

      try {
        const repository = getLotteryRepository();
        const createParams = convertFormToCreateParams(formData, imageUrl);

        // Add contract address to params
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
        resetWrite();
        setIsSubmitting(false);
      }
    };

    saveToBackend();
  }, [isTxSuccess, marketAddress, router, resetWrite]);

  const submit = async (data: LotteryCreateFormData) => {
    setIsSubmitting(true);

    try {
      // Step 1: Upload image to R2 via backend
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

      // Step 3: Call contract
      writeContract({
        address: getWaffleFactoryAddress(CHAIN_ID),
        args: [
          mTypeNum,
          ticketPriceWei,
          goalAmountWei,
          BigInt(data.winnerCount), // preparedQuantity
          BigInt(durationSeconds),
        ],
        value: sellerDeposit,
      });
    } catch (error) {
      toast.error('마켓 생성 준비에 실패했습니다');
      console.error('Create lottery error:', error);
      setIsSubmitting(false);
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
