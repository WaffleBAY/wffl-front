'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import { getLotteryRepository } from '../repository';
import { Lottery } from '../types';

interface UseMyEntriesReturn {
  isLoading: boolean;
  data: Lottery[];
  count: number;
}

export function useMyEntries(page = 1, limit = 100): UseMyEntriesReturn {
  const { walletAddress, _hasHydrated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['my-entries', walletAddress, page, limit],
    queryFn: async () => {
      const repository = getLotteryRepository();
      return repository.getMyParticipations(walletAddress ?? '', { page, limit });
    },
    enabled: _hasHydrated && !!walletAddress,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Return early state when not hydrated or not connected
  if (!_hasHydrated || !walletAddress) {
    return { isLoading: true, data: [], count: 0 };
  }

  return {
    isLoading,
    data: data?.items ?? [],
    count: data?.total ?? 0,
  };
}
