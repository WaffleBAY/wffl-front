'use client';

import { useState, useCallback } from 'react';
import { getLotteryRepository } from '../repository';

interface UseDeliveryActionsReturn {
  settle: (lotteryId: string) => Promise<void>;
  claimRefund: (lotteryId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for contract delivery/settlement actions
 * - settle: Settle the market after winners are revealed (LOTTERY: 95% → winner, 5% → ops; RAFFLE: pool → seller)
 * - claimRefund: Participants claim deposit refund (FAILED: deposit + pool share; COMPLETED: deposit only)
 */
export function useDeliveryActions(): UseDeliveryActionsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const settle = useCallback(async (lotteryId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const repository = getLotteryRepository();
      await repository.settle(lotteryId);
    } catch (err) {
      const message = err instanceof Error ? err.message : '정산에 실패했습니다.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const claimRefund = useCallback(async (lotteryId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const repository = getLotteryRepository();
      await repository.claimRefund(lotteryId);
    } catch (err) {
      const message = err instanceof Error ? err.message : '환불 신청에 실패했습니다.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    settle,
    claimRefund,
    isLoading,
    error,
  };
}
