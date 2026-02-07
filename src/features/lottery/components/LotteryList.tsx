'use client';

import { useMemo, useState } from 'react';
import { Lottery } from '../types';
import { LotteryCard } from './LotteryCard';
import { SortSelect, SortOption } from './SortSelect';
import { useRegionStore } from '@/features/region';

interface LotteryListProps {
  lotteries: Lottery[];
}

export function LotteryList({ lotteries }: LotteryListProps) {
  const [sortOption, setSortOption] = useState<SortOption>('latest');
  const userCountry = useRegionStore((state) => state.userCountry);
  const _hasHydrated = useRegionStore((state) => state._hasHydrated);

  const filteredAndSorted = useMemo(() => {
    let result = lotteries;
    if (userCountry && _hasHydrated) {
      result = lotteries.filter((lottery) => {
        if (lottery.shippingRegions?.includes('WORLDWIDE')) return true;
        return lottery.shippingRegions?.includes(userCountry);
      });
    }

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
  }, [lotteries, sortOption, userCountry, _hasHydrated]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredAndSorted.length}개의 복권
        </p>
        <SortSelect value={sortOption} onChange={setSortOption} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredAndSorted.map((lottery) => (
          <LotteryCard key={lottery.id} lottery={lottery} />
        ))}
      </div>

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
