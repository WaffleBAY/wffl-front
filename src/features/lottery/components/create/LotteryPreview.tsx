'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatWLD } from '../../utils/formatters';
import type { LotteryCreateFormData } from '../../schemas/lotteryCreateSchema';

interface LotteryPreviewProps {
  formData: Partial<LotteryCreateFormData>;
  previewUrl: string | null;
}

export function LotteryPreview({ formData, previewUrl }: LotteryPreviewProps) {
  const {
    title = '상품명 미입력',
    entryPrice = 0,
    targetAmount = 0,
    winnerCount = 1,
    expiresAt,
  } = formData;

  // Calculate days remaining
  const daysRemaining = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">미리보기</h3>

      <Card className="overflow-hidden pointer-events-none">
        {/* Image Preview */}
        <div className="relative aspect-[16/9] w-full bg-muted">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="미리보기"
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              이미지 없음
            </div>
          )}
          <Badge className="absolute top-2 right-2">진행중</Badge>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-base line-clamp-2">
            {title || '상품명 미입력'}
          </h3>

          {/* Entry Price */}
          <p className="text-sm text-muted-foreground">
            응모가격:{' '}
            <span className="font-medium text-foreground">
              {formatWLD(BigInt(entryPrice || 0))} WLD
            </span>
          </p>

          {/* Progress Bar - starts at 0% */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0명 참여</span>
              <span>0%</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>

          {/* Remaining Time */}
          <div className="text-sm">
            <span className="text-muted-foreground">남은 시간: </span>
            {expiresAt ? (
              <span className="font-medium">{daysRemaining}일</span>
            ) : (
              <span className="text-muted-foreground">날짜 미선택</span>
            )}
          </div>

          {/* Additional Info */}
          <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
            <p>목표 금액: {formatWLD(targetAmount || 0)} WLD</p>
            <p>당첨 인원: {winnerCount || 1}명</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
