'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/features/auth';
import { getLotteryRepository } from '../repository';
import { Lottery, LotteryStatus } from '../types';

interface UseMyLotteriesReturn {
  isLoading: boolean;
  data: Lottery[];
  count: number;
}

export function useMyLotteries(
  filterStatus?: LotteryStatus | 'all'
): UseMyLotteriesReturn {
  const { walletAddress, _hasHydrated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Lottery[]>([]);

  useEffect(() => {
    if (!_hasHydrated || !walletAddress) {
      setIsLoading(false);
      setData([]);
      return;
    }

    const fetchLotteries = async () => {
      setIsLoading(true);
      try {
        const repository = getLotteryRepository();
        const result = await repository.getMyLotteries(walletAddress, {
          page: 1,
          limit: 100,
        });

        let lotteries = result.items;

        // Apply client-side filter if specified and not 'all'
        if (filterStatus && filterStatus !== 'all') {
          lotteries = lotteries.filter((l) => l.status === filterStatus);
        }

        setData(lotteries);
      } catch (error) {
        console.error('Failed to fetch my lotteries:', error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLotteries();
  }, [walletAddress, _hasHydrated, filterStatus]);

  // Return early state when not hydrated or not connected
  if (!_hasHydrated || !walletAddress) {
    return { isLoading: true, data: [], count: 0 };
  }

  return {
    isLoading,
    data,
    count: data.length,
  };
}
