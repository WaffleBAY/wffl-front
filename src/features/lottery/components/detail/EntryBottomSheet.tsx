'use client';

import { useEffect } from 'react';
import { Sheet } from 'react-modal-sheet';
import { formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Lottery } from '../../types';
import type { EntryStep } from '../../hooks/useContractWrite';

interface EntryBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  lottery: Lottery;
  enter: () => void;
  step: EntryStep;
  requiredValue: bigint | undefined;
  error: string | null;
}

const LoadingSpinner = () => (
  <svg
    className="h-5 w-5 animate-spin"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const STEP_LABELS: Record<string, string> = {
  verifying: 'WorldID 인증 중...',
  signing: '서명 중...',
  confirming: '트랜잭션 처리 중...',
};

export function EntryBottomSheet({
  isOpen,
  onClose,
  lottery,
  enter,
  step,
  requiredValue,
  error,
}: EntryBottomSheetProps) {
  // Close sheet on success
  useEffect(() => {
    if (step === 'success') {
      onClose();
    }
  }, [step, onClose]);

  const isProcessing = step === 'verifying' || step === 'signing' || step === 'confirming';

  const handleBackdropTap = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleBackdropTap}
      snapPoints={[0, 0.5]}
      initialSnap={1}
    >
      <Sheet.Container>
        <Sheet.Header />
        <Sheet.Content>
          <div className="flex flex-col px-6 pb-8">
            {/* Title */}
            <h2 className="mb-4 text-xl font-bold text-foreground">응모 확인</h2>

            {/* Lottery title */}
            <p className="mb-4 text-base font-medium text-foreground">
              {lottery.title}
            </p>

            {/* Price info box */}
            <div className="mb-4 rounded-xl bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">응모 금액</span>
                <span className="text-lg font-bold text-foreground">
                  {requiredValue ? `${formatEther(requiredValue)} WLD` : `${formatEther(BigInt(lottery.ticketPrice))} WLD`}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                티켓 가격 + 참가 보증금
              </p>
            </div>

            {/* Error display */}
            {error && (
              <p className="mb-4 text-sm text-destructive">{error}</p>
            )}

            {/* Warning */}
            <p className="mb-4 text-sm text-destructive">
              응모하면 취소할 수 없습니다.
            </p>

            {/* Single entry button */}
            <Button
              onClick={enter}
              disabled={isProcessing}
              className="w-full py-6 text-base font-semibold"
              size="lg"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner />
                  {STEP_LABELS[step] || '처리 중...'}
                </span>
              ) : (
                '응모하기'
              )}
            </Button>
          </div>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop onTap={handleBackdropTap} />
    </Sheet>
  );
}
