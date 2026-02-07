'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageOff } from 'lucide-react';
import { Lottery, MarketType } from '../types';
import { CountdownTimer } from './CountdownTimer';
import { formatWLD, getStatusBadgeVariant, getStatusLabel } from '../utils/formatters';

interface LotteryCardProps {
  lottery: Lottery;
}

export function LotteryCard({ lottery }: LotteryCardProps) {
  const [imgError, setImgError] = useState(false);
  const isRaffle = lottery.marketType === MarketType.RAFFLE;

  return (
    <Link href={`/lottery/${lottery.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative aspect-[16/9] w-full bg-muted">
          {!imgError && lottery.imageUrl ? (
            <Image
              src={lottery.imageUrl}
              alt={lottery.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageOff className="h-8 w-8 text-muted-foreground/40" />
            </div>
          )}
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
          <h3 className="font-semibold text-base line-clamp-2">
            {lottery.title}
          </h3>

          <p className="text-sm text-muted-foreground">
            응모가격: <span className="font-medium text-foreground">{formatWLD(lottery.ticketPrice)} WLD</span>
          </p>

          <CountdownTimer endTime={lottery.endTime} />
        </CardContent>
      </Card>
    </Link>
  );
}
