'use client';

import { useState, useCallback, useEffect } from 'react';
import { isAddressEqual, type Address } from 'viem';
import { useAuthStore } from '@/features/auth';
import { toast } from 'sonner';
import { LotteryStatus } from '../types';
import { useEnterMarket, type EntryStep } from './useContractWrite';

interface UseEntryReturn {
  hasEntered: boolean;
  canEnter: boolean;
  enter: () => void;
  step: EntryStep;
  requiredValue: bigint | undefined;
  error: string | null;
  reset: () => void;
}

export function useEntry(
  lotteryId: string,
  lotteryStatus: LotteryStatus,
  contractAddress: string | undefined,
  ticketPrice: string,
  participantAddresses: string[] = []
): UseEntryReturn {
  const [hasEntered, setHasEntered] = useState(false);

  const { walletAddress } = useAuthStore();

  const {
    enterMarket,
    reset,
    step,
    requiredValue,
    error,
  } = useEnterMarket(contractAddress as Address | undefined, ticketPrice);

  // Check if user has already entered
  useEffect(() => {
    if (walletAddress && participantAddresses.length > 0) {
      const alreadyEntered = participantAddresses.some((addr) =>
        isAddressEqual(addr as Address, walletAddress as Address)
      );
      setHasEntered(alreadyEntered);
    }
  }, [walletAddress, participantAddresses]);

  // Update hasEntered on successful confirmation
  useEffect(() => {
    if (step === 'success') {
      setHasEntered(true);
      toast.success('응모가 완료되었습니다!');
    }
  }, [step]);

  // Show error toast
  useEffect(() => {
    if (step === 'error' && error) {
      toast.error(error);
    }
  }, [step, error]);

  const canEnter = !hasEntered && lotteryStatus === LotteryStatus.OPEN;

  const enter = useCallback(() => {
    enterMarket(lotteryId);
  }, [enterMarket, lotteryId]);

  return {
    hasEntered,
    canEnter,
    enter,
    step,
    requiredValue,
    error,
    reset,
  };
}
