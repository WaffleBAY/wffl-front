'use client';

import { CountdownTimer } from '../CountdownTimer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Loader2 } from 'lucide-react';
import type { Lottery } from '../../types/Lottery';
import type { DrawStep } from '../../hooks/useContractWrite';

interface OpenStatusUIProps {
  lottery: Lottery;
  hasEntered: boolean;
  onDraw?: () => void;
  drawStep?: DrawStep;
  isSeller?: boolean;
}

export function OpenStatusUI({ lottery, hasEntered, onDraw, drawStep, isSeller }: OpenStatusUIProps) {
  const isExpired = Date.now() / 1000 >= lottery.endTime;
  const isDrawProcessing = drawStep === 'signing' || drawStep === 'confirming';

  if (isExpired) {
    return (
      <div className="p-4 bg-muted/50 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-foreground">응모가 마감되었습니다</span>
            <span className="text-xs text-muted-foreground">
              추첨을 실행하여 당첨자를 선정하세요
            </span>
          </div>
          <Badge variant="outline" className="text-sm border-orange-300 text-orange-600">
            마감됨
          </Badge>
        </div>

        <Button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          onClick={onDraw}
          disabled={isDrawProcessing || drawStep === 'success'}
        >
          {isDrawProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {drawStep === 'signing' ? '서명 중...' : '확인 중...'}
            </>
          ) : drawStep === 'success' ? (
            '추첨 완료!'
          ) : (
            <>
              <Trophy className="w-4 h-4 mr-2" />
              추첨하기
            </>
          )}
        </Button>

        {drawStep === 'error' && (
          <p className="text-xs text-red-500 text-center">
            추첨에 실패했습니다. 다시 시도해주세요.
          </p>
        )}
      </div>
    );
  }

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
        ) : isSeller ? (
          <Badge variant="outline" className="text-sm">
            내 마켓
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
