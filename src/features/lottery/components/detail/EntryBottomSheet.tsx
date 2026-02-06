'use client';

import { useEffect } from 'react';
import { Sheet } from 'react-modal-sheet';
import { formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Lottery } from '../../types';

interface EntryBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  lottery: Lottery;

  // Two-step flow
  verifyWorldId: () => Promise<void>;
  enter: () => void;
  isVerifying: boolean;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  requiredValue: bigint | undefined;
  error: string | null;
  canSubmitTx: boolean;
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

export function EntryBottomSheet({
  isOpen,
  onClose,
  lottery,
  verifyWorldId,
  enter,
  isVerifying,
  isPending,
  isConfirming,
  isConfirmed,
  requiredValue,
  error,
  canSubmitTx,
}: EntryBottomSheetProps) {
  // Close sheet on successful confirmation
  useEffect(() => {
    if (isConfirmed) {
      onClose();
    }
  }, [isConfirmed, onClose]);

  const handleBackdropTap = () => {
    if (!isVerifying && !isPending && !isConfirming) {
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
                  {requiredValue ? `${formatEther(requiredValue)} ETH` : '계산 중...'}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                티켓 가격 + 보증금 0.005 ETH
              </p>
            </div>

            {/* Error display */}
            {error && (
              <p className="mb-4 text-sm text-destructive">{error}</p>
            )}

            {/* Two-step buttons */}
            {!canSubmitTx ? (
              <>
                <p className="mb-4 text-sm text-muted-foreground">
                  WorldID로 본인 인증이 필요합니다.
                </p>
                <Button
                  onClick={async () => {
                    try {
                      await verifyWorldId();
                    } catch {
                      // Error already toasted in hook
                    }
                  }}
                  disabled={isVerifying}
                  className="w-full py-6 text-base font-semibold"
                  size="lg"
                >
                  {isVerifying ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner />
                      인증 중...
                    </span>
                  ) : (
                    'WorldID 인증하기'
                  )}
                </Button>
              </>
            ) : (
              <>
                <p className="mb-4 text-sm text-destructive">
                  응모하면 취소할 수 없습니다.
                </p>
                <Button
                  onClick={enter}
                  disabled={isPending || isConfirming}
                  className="w-full py-6 text-base font-semibold"
                  size="lg"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner />
                      서명 중...
                    </span>
                  ) : isConfirming ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner />
                      처리 중...
                    </span>
                  ) : (
                    '응모하기'
                  )}
                </Button>
              </>
            )}
          </div>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop onTap={handleBackdropTap} />
    </Sheet>
  );
}
