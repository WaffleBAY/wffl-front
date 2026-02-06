'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LotteryStatus } from '../types';

interface StatusFilterProps {
  value: LotteryStatus | 'all';
  onChange: (status: LotteryStatus | 'all') => void;
}

const STATUS_TABS: Array<{ value: LotteryStatus | 'all'; label: string }> = [
  { value: 'all', label: '전체' },
  { value: LotteryStatus.OPEN, label: '진행중' },
  { value: LotteryStatus.CLOSED, label: '마감' },
  { value: LotteryStatus.COMMITTED, label: '추첨준비' },
  { value: LotteryStatus.REVEALED, label: '당첨발표' },
  { value: LotteryStatus.COMPLETED, label: '완료' },
  { value: LotteryStatus.FAILED, label: '실패' },
];

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as LotteryStatus | 'all')}>
      <TabsList className="w-full overflow-x-auto flex-nowrap justify-start h-auto p-1">
        {STATUS_TABS.map((tab) => (
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
  );
}
