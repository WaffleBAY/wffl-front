'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ImageOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Lottery } from '../../types';
import { getStatusBadgeVariant, getStatusLabel } from '../../utils/formatters';

interface LotteryHeaderProps {
  lottery: Lottery;
}

export function LotteryHeader({ lottery }: LotteryHeaderProps) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative aspect-[16/9] w-full bg-muted">
      {!imgError && lottery.imageUrl ? (
        <Image
          src={lottery.imageUrl}
          alt={lottery.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ImageOff className="h-12 w-12 text-muted-foreground/40" />
        </div>
      )}

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
