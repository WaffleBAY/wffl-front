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
import { PartyPopper, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OpenMarketResultDialogProps {
  isSuccess: boolean;
  isError: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onRetry: () => void;
}

/**
 * Dialog to show openMarket transaction result.
 * Success: Celebration message with checkmark
 * Error: Error message with retry button
 */
export function OpenMarketResultDialog({
  isSuccess,
  isError,
  errorMessage,
  onClose,
  onRetry,
}: OpenMarketResultDialogProps) {
  const isOpen = isSuccess || isError;

  if (!isOpen) return null;

  if (isSuccess) {
    return (
      <AlertDialog open onOpenChange={onClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <PartyPopper className="h-6 w-6 text-yellow-500" />
              <AlertDialogTitle>마켓이 열렸습니다!</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              이제 응모자들을 기다리세요. 응모 기간이 끝나면 자동으로 추첨이 진행됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={onClose}>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Error case
  return (
    <AlertDialog open onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <AlertDialogTitle>마켓 열기 실패</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {errorMessage || '알 수 없는 오류가 발생했습니다.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
          <Button onClick={onRetry}>
            다시 시도
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
