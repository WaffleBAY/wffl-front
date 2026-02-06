'use client';

import { useState, useCallback, useEffect } from 'react';
import { isAddressEqual, type Address } from 'viem';
import { useAuthStore } from '@/features/auth';
import { toast } from 'sonner';
import { LotteryStatus } from '../types';
import { useEnterMarket } from './useContractWrite';

interface UseEntryReturn {
  // Existing
  isLoading: boolean;
  hasEntered: boolean;
  canEnter: boolean;
  needsVerification: boolean;
  triggerVerification: () => void;

  // Two-step flow
  verifyWorldId: () => Promise<void>;
  enter: () => void;
  isVerifying: boolean;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  requiredValue: bigint | undefined;
  error: string | null;
  canSubmitTx: boolean;
  reset: () => void;
}

export function useEntry(
  lotteryId: string,
  lotteryStatus: LotteryStatus,
  contractAddress: string | undefined,
  participantAddresses: string[] = []
): UseEntryReturn {
  const [hasEntered, setHasEntered] = useState(false);

  const { walletAddress, isWorldIdVerified } = useAuthStore();

  // Integrate useEnterMarket hook for contract interactions
  const {
    verifyWorldId: contractVerifyWorldId,
    enter: contractEnter,
    isVerifying,
    isPending,
    isConfirming,
    isConfirmed,
    requiredValue,
    error: contractError,
    canEnter: canSubmitTx,
    reset,
  } = useEnterMarket(contractAddress as Address | undefined);

  // Check if user has already entered on mount
  useEffect(() => {
    if (walletAddress && participantAddresses.length > 0) {
      const alreadyEntered = participantAddresses.some((addr) => isAddressEqual(addr as Address, walletAddress as Address));
      setHasEntered(alreadyEntered);
    }
  }, [walletAddress, participantAddresses]);

  // Update hasEntered on successful confirmation
  useEffect(() => {
    if (isConfirmed) {
      setHasEntered(true);
      toast.success('응모가 완료되었습니다!');
    }
  }, [isConfirmed]);

  // Computed states
  const needsVerification = !isWorldIdVerified;
  const canEnter =
    isWorldIdVerified && !hasEntered && lotteryStatus === LotteryStatus.OPEN;

  // Combined loading state
  const isLoading = isVerifying || isPending || isConfirming;

  // Verification trigger - navigates to auth page with return URL
  const triggerVerification = useCallback(() => {
    window.location.href = `/auth?returnTo=/lottery/${lotteryId}`;
  }, [lotteryId]);

  // WorldID verification via contract hook
  const verifyWorldId = useCallback(async () => {
    try {
      await contractVerifyWorldId(lotteryId);
    } catch (err) {
      console.error('WorldID verification failed:', err);
      toast.error(err instanceof Error ? err.message : 'WorldID 인증에 실패했습니다');
      throw err;
    }
  }, [contractVerifyWorldId, lotteryId]);

  // Entry function using contract hook
  const enter = useCallback(() => {
    contractEnter();
  }, [contractEnter]);

  return {
    isLoading,
    hasEntered,
    canEnter,
    needsVerification,
    triggerVerification,
    verifyWorldId,
    enter,
    isVerifying,
    isPending,
    isConfirming,
    isConfirmed,
    requiredValue,
    error: contractError,
    canSubmitTx,
    reset,
  };
}
