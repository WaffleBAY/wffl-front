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
    enter,
    step,
    requiredValue,
    error,
    reset,
  } = useEntry(lottery.id, lottery.status, lottery.contractAddress, lottery.ticketPrice, participantAddresses);

  // Already entered
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

  if (!canEnter) return null;

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
        enter={enter}
        step={step}
        requiredValue={requiredValue}
        error={error}
      />
    </>
  );
}
