'use client';

import { CheckCircle } from 'lucide-react';
import type { Lottery } from '../../types/Lottery';

interface CompletedStatusUIProps {
  lottery: Lottery;
}

export function CompletedStatusUI({ lottery }: CompletedStatusUIProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Success icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
        <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-500" />
      </div>

      {/* Title */}
      <h3 className="mb-2 text-xl font-bold text-foreground">
        거래가 성공적으로 완료되었습니다
      </h3>

      {/* Subtitle - lottery title */}
      <p className="text-sm text-muted-foreground">{lottery.title}</p>
    </div>
  );
}
