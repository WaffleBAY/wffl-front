'use client';

import { Lottery, MarketType } from '../../types';
import { formatWLD } from '../../utils/formatters';
import { Badge } from '@/components/ui/badge';

interface LotteryInfoProps {
  lottery: Lottery;
}

export function LotteryInfo({ lottery }: LotteryInfoProps) {
  const isRaffle = lottery.marketType === MarketType.RAFFLE;

  return (
    <div className="space-y-4 px-4">
      {/* Title with market type badge */}
      <div className="flex items-start justify-between gap-2">
        <h1 className="text-xl font-bold text-foreground">{lottery.title}</h1>
        <Badge variant="outline" className="shrink-0">
          {isRaffle ? '래플' : '복권'}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {lottery.description}
      </p>

      {/* Price section */}
      <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">응모 가격</span>
          <span className="text-lg font-semibold text-foreground">
            {formatWLD(lottery.ticketPrice)} WLD
          </span>
        </div>

        {isRaffle ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">경품 수량</span>
              <span className="text-base font-medium text-foreground">
                {lottery.preparedQuantity}개
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">판매자 보증금</span>
              <span className="text-base font-medium text-foreground">
                {formatWLD(lottery.sellerDeposit)} WLD
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">목표 금액</span>
              <span className="text-base font-medium text-foreground">
                {formatWLD(lottery.goalAmount)} WLD
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">현재 상금</span>
              <span className="text-base font-medium text-foreground">
                {formatWLD(lottery.prizePool)} WLD
              </span>
            </div>
          </>
        )}

        <div className="border-t pt-2 mt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>참가자 보증금 (응모가격의 5%)</span>
            <span>{formatWLD(lottery.participantDeposit)} WLD</span>
          </div>
        </div>
      </div>
    </div>
  );
}
