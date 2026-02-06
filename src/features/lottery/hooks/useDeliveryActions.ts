'use client';

import { useState, useCallback } from 'react';
import { getLotteryRepository } from '../repository';

interface UseDeliveryActionsReturn {
  confirmReceipt: (lotteryId: string) => Promise<void>;
  claimRefund: (lotteryId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for contract delivery/settlement actions
 * - confirmReceipt: Winner confirms they received the prize (triggers settlement)
 * - claimRefund: Non-winners or failed market participants claim their refund
 */
export function useDeliveryActions(): UseDeliveryActionsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmReceipt = useCallback(async (lotteryId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const repository = getLotteryRepository();
      await repository.confirmReceipt(lotteryId);
    } catch (err) {
      const message = err instanceof Error ? err.message : '수령 확인에 실패했습니다.';
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
    confirmReceipt,
    claimRefund,
    isLoading,
    error,
  };
}
