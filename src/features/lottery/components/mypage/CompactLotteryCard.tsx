'use client';

import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  PlayCircle,
  Lock,
  Loader2,
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Lottery } from '../../types';
import { getStatusLabel, getStatusIcon } from '../../utils/formatters';

interface CompactLotteryCardProps {
  lottery: Lottery;
  entryDate?: string;
}

const iconMap = {
  play: PlayCircle,
  lock: Lock,
  loader: Loader2,
  package: Package,
  truck: Truck,
  check: CheckCircle2,
  alert: AlertTriangle,
} as const;

export function CompactLotteryCard({ lottery, entryDate }: CompactLotteryCardProps) {
  const iconName = getStatusIcon(lottery.status) as keyof typeof iconMap;
  const StatusIcon = iconMap[iconName];

  const displayDate = entryDate
    ? `${format(new Date(entryDate), 'M월 d일', { locale: ko })} 응모`
    : `${format(new Date(lottery.endTime * 1000), 'M월 d일', { locale: ko })} 마감`;

  return (
    <Link href={`/lottery/${lottery.id}`}>
      <div className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
        {/* Thumbnail */}
        <div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden">
          <Image
            src={lottery.imageUrl}
            alt={lottery.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
          {/* Title */}
          <h3 className="font-medium text-sm line-clamp-1">{lottery.title}</h3>

          {/* Status */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{getStatusLabel(lottery.status)}</span>
          </div>

          {/* Date */}
          <p className="text-xs text-muted-foreground">{displayDate}</p>
        </div>
      </div>
    </Link>
  );
}
