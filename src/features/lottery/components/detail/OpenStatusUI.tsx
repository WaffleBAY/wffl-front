'use client';

import { CountdownTimer } from '../CountdownTimer';
import { Badge } from '@/components/ui/badge';
import type { Lottery } from '../../types/Lottery';

interface OpenStatusUIProps {
  lottery: Lottery;
  hasEntered: boolean;
}

export function OpenStatusUI({ lottery, hasEntered }: OpenStatusUIProps) {
  return (
    <div className="p-4 bg-muted/50 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">마감까지</span>
          <CountdownTimer endTime={lottery.endTime} />
        </div>
        {hasEntered ? (
          <Badge variant="secondary" className="text-sm">
            응모 완료
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">
            응모 가능
          </span>
        )}
      </div>
    </div>
  );
}
