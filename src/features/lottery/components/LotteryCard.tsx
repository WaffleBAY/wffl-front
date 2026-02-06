'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Lottery, MarketType } from '../types';
import { CountdownTimer } from './CountdownTimer';
import { formatETH, getStatusBadgeVariant, getStatusLabel } from '../utils/formatters';

interface LotteryCardProps {
  lottery: Lottery;
}

export function LotteryCard({ lottery }: LotteryCardProps) {
  const isRaffle = lottery.marketType === MarketType.RAFFLE;

  // For LOTTERY: progress based on prizePool vs goalAmount
  // For RAFFLE: progress based on participantCount vs preparedQuantity
  const progressPercent = isRaffle
    ? Math.min((lottery.participantCount / lottery.preparedQuantity) * 100, 100)
    : BigInt(lottery.goalAmount) > BigInt(0)
      ? Math.min(
          (Number(BigInt(lottery.prizePool)) / Number(BigInt(lottery.goalAmount))) * 100,
          100
        )
      : 0;

  return (
    <Link href={`/lottery/${lottery.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        {/* Image with 16:9 aspect ratio - prevents layout shift */}
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={lottery.imageUrl}
            alt={lottery.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge variant="outline" className="bg-white/80 text-xs">
              {isRaffle ? '래플' : '복권'}
            </Badge>
            <Badge variant={getStatusBadgeVariant(lottery.status)}>
              {getStatusLabel(lottery.status)}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Title - 2 line clamp */}
          <h3 className="font-semibold text-base line-clamp-2">
            {lottery.title}
          </h3>

          {/* Entry Price */}
          <p className="text-sm text-muted-foreground">
            응모가격: <span className="font-medium text-foreground">{formatETH(lottery.ticketPrice)} ETH</span>
          </p>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{lottery.participantCount}명 참여</span>
              <span>{progressPercent.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Countdown Timer */}
          <CountdownTimer endTime={lottery.endTime} />
        </CardContent>
      </Card>
    </Link>
  );
}
