'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lottery } from '../../types';
import { useEntry } from '../../hooks/useEntry';
import { EntryBottomSheet } from './EntryBottomSheet';

interface EntryButtonProps {
  lottery: Lottery;
  participantAddresses: string[];
}

export function EntryButton({ lottery, participantAddresses }: EntryButtonProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const {
    hasEntered,
    canEnter,
    needsVerification,
    triggerVerification,
    verifyWorldId,
    enter,
    isVerifying,
    isPending,
    isConfirming,
    isConfirmed,
    requiredValue,
    error,
    canSubmitTx,
    reset,
  } = useEntry(lottery.id, lottery.status, lottery.contractAddress, participantAddresses);

  // Already entered - show completion badge
  if (hasEntered) {
    return (
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-background border-t">
        <Button
          variant="outline"
          className="w-full py-6 text-base font-semibold"
          size="lg"
          disabled
        >
          응모 완료
        </Button>
      </div>
    );
  }

  // Needs verification - show verification CTA
  if (needsVerification) {
    return (
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-background border-t">
        <Button
          onClick={triggerVerification}
          className="w-full py-6 text-base font-semibold"
          size="lg"
        >
          인증 후 응모하기
        </Button>
      </div>
    );
  }

  // Can enter - show entry button and bottom sheet
  if (canEnter) {
    return (
      <>
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-background border-t">
          <Button
            onClick={() => setIsSheetOpen(true)}
            className="w-full py-6 text-base font-semibold"
            size="lg"
          >
            응모하기
          </Button>
        </div>

        <EntryBottomSheet
          isOpen={isSheetOpen}
          onClose={() => {
            setIsSheetOpen(false);
            reset();
          }}
          lottery={lottery}
          verifyWorldId={verifyWorldId}
          enter={enter}
          isVerifying={isVerifying}
          isPending={isPending}
          isConfirming={isConfirming}
          isConfirmed={isConfirmed}
          requiredValue={requiredValue}
          error={error}
          canSubmitTx={canSubmitTx}
        />
      </>
    );
  }

  // Other cases (e.g., lottery not OPEN) - don't render button
  return null;
}
