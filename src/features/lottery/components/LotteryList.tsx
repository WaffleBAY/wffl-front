'use client';

import { useMemo, useState } from 'react';
import { Lottery, LotteryStatus } from '../types';
import { LotteryCard } from './LotteryCard';
import { StatusFilter } from './StatusFilter';
import { SortSelect, SortOption } from './SortSelect';
import { useRegionStore } from '@/features/region';

interface LotteryListProps {
  lotteries: Lottery[];
}

export function LotteryList({ lotteries }: LotteryListProps) {
  const [statusFilter, setStatusFilter] = useState<LotteryStatus | 'all'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('latest');
  const userCountry = useRegionStore((state) => state.userCountry);
  const _hasHydrated = useRegionStore((state) => state._hasHydrated);

  const filteredAndSorted = useMemo(() => {
    // Step 0: Filter by region (if user region is set and hydrated)
    let result = lotteries;
    if (userCountry && _hasHydrated) {
      result = lotteries.filter((lottery) => {
        // WORLDWIDE ships everywhere
        if (lottery.shippingRegions?.includes('WORLDWIDE')) return true;
        // Check if user country in shipping regions
        return lottery.shippingRegions?.includes(userCountry);
      });
    }
    // Show all if no region set (first visit before detection)

    // Step 1: Filter by status
    result = statusFilter === 'all'
      ? result
      : result.filter((l) => l.status === statusFilter);

    // Step 2: Sort (IMPORTANT: spread before sort to avoid mutating original)
    result = [...result].sort((a, b) => {
      switch (sortOption) {
        case 'latest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'ending_soon':
          return (a.endTime * 1000) - (b.endTime * 1000);
        case 'most_participants':
          return b.participantCount - a.participantCount;
        default:
          return 0;
      }
    });

    return result;
  }, [lotteries, statusFilter, sortOption, userCountry, _hasHydrated]);

  return (
    <div className="space-y-4">
      {/* Filter/Sort Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1 overflow-hidden">
          <StatusFilter value={statusFilter} onChange={setStatusFilter} />
        </div>
        <SortSelect value={sortOption} onChange={setSortOption} />
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {filteredAndSorted.length}개의 복권
      </p>

      {/* Card Grid - Single column for mobile-first */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAndSorted.map((lottery) => (
          <LotteryCard key={lottery.id} lottery={lottery} />
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSorted.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {userCountry
            ? '해당 조건의 복권이 없습니다.'
            : '복권을 불러오는 중...'}
        </div>
      )}
    </div>
  );
}
