'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Lottery } from '../../types';
import { getStatusBadgeVariant, getStatusLabel } from '../../utils/formatters';

interface LotteryHeaderProps {
  lottery: Lottery;
}

export function LotteryHeader({ lottery }: LotteryHeaderProps) {
  const router = useRouter();

  return (
    <div className="relative aspect-[16/9] w-full">
      <Image
        src={lottery.imageUrl}
        alt={lottery.title}
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />

      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-colors hover:bg-white"
        aria-label="뒤로 가기"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      {/* Status badge */}
      <Badge
        variant={getStatusBadgeVariant(lottery.status)}
        className="absolute right-4 top-4"
      >
        {getStatusLabel(lottery.status)}
      </Badge>
    </div>
  );
}
