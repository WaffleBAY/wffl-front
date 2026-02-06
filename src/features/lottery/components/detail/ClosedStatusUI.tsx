import { Badge } from '@/components/ui/badge';
import type { Lottery } from '../../types/Lottery';

interface ClosedStatusUIProps {
  lottery: Lottery;
}

export function ClosedStatusUI({ lottery }: ClosedStatusUIProps) {
  return (
    <div className="p-6 bg-muted/50 rounded-xl">
      <div className="flex flex-col items-center gap-3">
        <Badge variant="secondary" className="text-sm">
          마감됨
        </Badge>
        <p className="text-sm text-muted-foreground">
          추첨 대기 중입니다
        </p>
      </div>
    </div>
  );
}
