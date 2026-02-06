'use client';

import { Clock } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';
import { formatCountdown } from '../utils/formatters';

interface CountdownTimerProps {
  /** Unix timestamp in seconds */
  endTime: number;
}

export function CountdownTimer({ endTime }: CountdownTimerProps) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(endTime);
  const displayText = formatCountdown(days, hours, minutes, seconds, isExpired);

  return (
    <div className="flex items-center gap-1 text-sm">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <span className={isExpired ? 'text-muted-foreground' : 'text-orange-600 font-medium'}>
        {displayText}
      </span>
    </div>
  );
}
