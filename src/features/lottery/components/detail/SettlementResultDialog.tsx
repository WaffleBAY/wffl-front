'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PartyPopper, AlertCircle, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SettlementAction = 'settle' | 'claimRefund' | 'draw';

interface SettlementResultDialogProps {
  action: SettlementAction;
  isSuccess: boolean;
  isError: boolean;
  errorMessage: string | null;
  refundAmount?: string; // e.g., "5 WLD"
  onClose: () => void;
  onRetry: () => void;
}

/**
 * Dialog to show settlement transaction result (settle or claimRefund).
 * Success: Celebration message with appropriate icon
 * Error: Error message with retry button
 */
export function SettlementResultDialog({
  action,
  isSuccess,
  isError,
  errorMessage,
  refundAmount,
  onClose,
  onRetry,
}: SettlementResultDialogProps) {
  const isOpen = isSuccess || isError;

  if (!isOpen) return null;

  if (isSuccess) {
    const title = action === 'draw' ? '추첨 완료!' : action === 'settle' ? '정산 완료!' : '환불 완료!';
    const Icon = action === 'claimRefund' ? Coins : PartyPopper;
    const iconColor = action === 'claimRefund' ? 'text-green-500' : 'text-yellow-500';
    const description = action === 'draw'
      ? '추첨 및 정산이 완료되었습니다.'
      : action === 'settle'
        ? '마켓 정산이 완료되었습니다.'
        : `환불금 ${refundAmount || ''}이 반환되었습니다.`;

    return (
      <AlertDialog open onOpenChange={onClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <Icon className={`h-6 w-6 ${iconColor}`} />
              <AlertDialogTitle>{title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={onClose}>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Error case
  const errorTitle =
    action === 'draw' ? '추첨 실패' : action === 'settle' ? '정산 실패' : '환불 요청 실패';

  return (
    <AlertDialog open onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <AlertDialogTitle>{errorTitle}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {errorMessage || '알 수 없는 오류가 발생했습니다.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
          <Button onClick={onRetry}>다시 시도</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
