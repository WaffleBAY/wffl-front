'use client';

import { Progress } from '@/components/ui/progress';
import { Lottery, MarketType } from '../../types';
import { formatWLD } from '../../utils/formatters';

interface ParticipationProgressProps {
  lottery: Lottery;
}

export function ParticipationProgress({ lottery }: ParticipationProgressProps) {
  const isRaffle = lottery.marketType === MarketType.RAFFLE;

  // For LOTTERY: progress based on prizePool vs goalAmount
  // For RAFFLE: progress based on participantCount vs preparedQuantity
  const goalBigInt = BigInt(lottery.goalAmount);
  const progressPercent = isRaffle
    ? Math.min((lottery.participantCount / lottery.preparedQuantity) * 100, 100)
    : goalBigInt > BigInt(0)
      ? Math.min(
          (Number(BigInt(lottery.prizePool)) / Number(goalBigInt)) * 100,
          100
        )
      : 0;

  return (
    <div className="space-y-3 px-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">참여 현황</span>
        <span className="font-medium text-foreground">
          {progressPercent.toFixed(0)}%
        </span>
      </div>

      <Progress value={progressPercent} className="h-3" />

      <div className="flex items-center justify-between text-sm">
        {isRaffle ? (
          <span className="text-muted-foreground">
            {lottery.participantCount} / {lottery.preparedQuantity}명
          </span>
        ) : (
          <span className="text-muted-foreground">
            {formatWLD(lottery.prizePool)} / {formatWLD(lottery.goalAmount)} WLD
          </span>
        )}
        <span className="font-medium text-foreground">
          총 {lottery.participantCount}명 참여
        </span>
      </div>
    </div>
  );
}
