'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMyLotteries } from '../../hooks/useMyLotteries';
import { CompactLotteryCard } from './CompactLotteryCard';
import { CompactCardSkeleton } from './CompactCardSkeleton';
import { LotteryStatus } from '../../types';

type SalesFilter = LotteryStatus | 'all';

const SALES_FILTER_TABS: Array<{ value: SalesFilter; label: string }> = [
  { value: 'all', label: '전체' },
  { value: LotteryStatus.OPEN, label: '진행중' },
  { value: LotteryStatus.REVEALED, label: '당첨확정' },
  { value: LotteryStatus.COMPLETED, label: '완료' },
];

export function SalesList() {
  const [filter, setFilter] = useState<SalesFilter>('all');
  const { isLoading, data } = useMyLotteries(filter);

  return (
    <div className="space-y-4">
      {/* Sub-filter tabs */}
      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as SalesFilter)}
      >
        <TabsList className="w-full overflow-x-auto flex-nowrap justify-start h-auto p-1">
          {SALES_FILTER_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="shrink-0 px-3 py-1.5 text-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* List content */}
      {isLoading ? (
        <div className="space-y-3">
          <CompactCardSkeleton />
          <CompactCardSkeleton />
          <CompactCardSkeleton />
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground text-sm">
            아직 등록한 복권이 없어요
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((lottery) => (
            <CompactLotteryCard
              key={lottery.id}
              lottery={lottery}
            />
          ))}
        </div>
      )}
    </div>
  );
}
