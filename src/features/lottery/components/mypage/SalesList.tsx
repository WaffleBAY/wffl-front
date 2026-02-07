'use client';

import { useMyLotteries } from '../../hooks/useMyLotteries';
import { CompactLotteryCard } from './CompactLotteryCard';
import { CompactCardSkeleton } from './CompactCardSkeleton';

export function SalesList() {
  const { isLoading, data } = useMyLotteries();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <CompactCardSkeleton />
        <CompactCardSkeleton />
        <CompactCardSkeleton />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground text-sm">
          아직 등록한 복권이 없어요
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((lottery) => (
        <CompactLotteryCard
          key={lottery.id}
          lottery={lottery}
        />
      ))}
    </div>
  );
}
