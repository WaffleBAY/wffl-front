'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import type { Address } from 'viem';
import { Lottery, LotteryStatus } from '../../types';
import { getLotteryRepository } from '../../repository';
import { useAuthStore } from '@/features/auth';
import { useUserRole } from '../../hooks/useUserRole';
import { useCelebrationStore } from '../../store/useCelebrationStore';
import { formatEther } from 'viem';
import { useOpenMarket, useSettle, useClaimRefund, useCloseDrawAndSettle } from '../../hooks/useContractWrite';
import { PARTICIPANT_DEPOSIT } from '@/config/contracts';
import { useLotteryContractData } from '../../hooks/useContractRead';
import { LotteryHeader } from './LotteryHeader';
import { LotteryInfo } from './LotteryInfo';
import { ParticipationProgress } from './ParticipationProgress';
import { SellerInfo } from './SellerInfo';
import { LotteryStatusUI } from './LotteryStatusUI';
import { EntryButton } from './EntryButton';
import { OpenMarketResultDialog } from './OpenMarketResultDialog';
import { SettlementResultDialog } from './SettlementResultDialog';

const WinnerCelebration = dynamic(
  () => import('./WinnerCelebration').then((mod) => ({ default: mod.WinnerCelebration })),
  { ssr: false }
);

interface LotteryDetailProps {
  lottery: Lottery;
}

export function LotteryDetail({ lottery }: LotteryDetailProps) {
  const router = useRouter();
  const [participantAddresses, setParticipantAddresses] = useState<string[]>([]);
  const { walletAddress } = useAuthStore();

  // OpenMarket hook for seller action
  const {
    openMarket,
    reset: resetOpenMarket,
    step: openMarketStep,
    isConfirmed: isOpenMarketConfirmed,
    error: openMarketError,
    canOpen,
  } = useOpenMarket(lottery.contractAddress as Address | undefined);

  const handleOpenMarket = () => {
    if (canOpen) openMarket();
  };

  const handleOpenMarketResultClose = () => {
    resetOpenMarket();
    if (isOpenMarketConfirmed) router.refresh();
  };

  const handleOpenMarketRetry = () => {
    resetOpenMarket();
    handleOpenMarket();
  };

  // Settle hook for settlement after REVEALED
  const {
    settle,
    reset: resetSettle,
    step: settleStep,
    isConfirmed: isSettleConfirmed,
    error: settleError,
    canSettle,
  } = useSettle(lottery.contractAddress as Address | undefined);

  const handleSettle = () => {
    if (canSettle) settle();
  };

  const handleSettleResultClose = () => {
    resetSettle();
    if (isSettleConfirmed) router.refresh();
  };

  const handleSettleRetry = () => {
    resetSettle();
    handleSettle();
  };

  // ClaimRefund hook for participant refund
  const {
    claimRefund,
    reset: resetClaimRefund,
    step: claimRefundStep,
    isConfirmed: isClaimRefundConfirmed,
    error: claimRefundError,
    canClaim,
  } = useClaimRefund(lottery.contractAddress as Address | undefined);

  const handleClaimRefund = () => {
    if (canClaim) claimRefund();
  };

  const handleClaimRefundResultClose = () => {
    resetClaimRefund();
    if (isClaimRefundConfirmed) router.refresh();
  };

  const handleClaimRefundRetry = () => {
    resetClaimRefund();
    handleClaimRefund();
  };

  // CloseDrawAndSettle hook for draw + settlement
  const {
    closeDrawAndSettle,
    reset: resetDraw,
    step: drawStep,
    error: drawError,
  } = useCloseDrawAndSettle(lottery.contractAddress as Address | undefined);

  const handleDraw = () => {
    closeDrawAndSettle();
  };

  const handleDrawResultClose = () => {
    resetDraw();
    if (drawStep === 'success') router.refresh();
  };

  const handleDrawRetry = () => {
    resetDraw();
    handleDraw();
  };

  // On-chain contract data (participants, winners, status)
  const contractData = useLotteryContractData(lottery.contractAddress as Address | undefined);

  // Calculate refund amount for dialog based on status
  // FAILED: ticketPrice + participantDeposit (pool share)
  // COMPLETED: participantDeposit only
  const getRefundAmountForDialog = () => {
    if (lottery.status === LotteryStatus.FAILED) {
      const totalRefund = BigInt(lottery.ticketPrice) + PARTICIPANT_DEPOSIT;
      return formatEther(totalRefund) + ' WLD';
    }
    // COMPLETED status (deposit refund)
    return formatEther(PARTICIPANT_DEPOSIT) + ' WLD';
  };

  // Celebration state
  const role = useUserRole(lottery);
  const celebrationHasHydrated = useCelebrationStore((state) => state._hasHydrated);
  const hasCelebrated = useCelebrationStore((state) => state.hasCelebrated);
  const markCelebrated = useCelebrationStore((state) => state.markCelebrated);
  const [celebrationDismissed, setCelebrationDismissed] = useState(false);

  // Fetch participants on mount
  useEffect(() => {
    const fetchParticipants = async () => {
      const repository = getLotteryRepository();
      const participants = await repository.getParticipants(lottery.id);
      setParticipantAddresses(participants);
    };
    fetchParticipants();
  }, [lottery.id]);

  // Compute hasEntered for status UI
  const hasEntered = useMemo(() => {
    if (!walletAddress || participantAddresses.length === 0) {
      return false;
    }
    return participantAddresses.includes(walletAddress);
  }, [walletAddress, participantAddresses]);

  // Determine if celebration should show (derived state)
  const shouldShowCelebration = useMemo(() => {
    if (!celebrationHasHydrated) return false;
    if (celebrationDismissed) return false;

    const isWinningStatus = [
      LotteryStatus.REVEALED,
      LotteryStatus.COMPLETED,
    ].includes(lottery.status);

    return role === 'winner' && isWinningStatus && !hasCelebrated(lottery.id);
  }, [celebrationHasHydrated, celebrationDismissed, role, lottery.id, lottery.status, hasCelebrated]);

  // Mark as celebrated when shown (external sync effect)
  useEffect(() => {
    if (shouldShowCelebration) {
      markCelebrated(lottery.id);
    }
  }, [shouldShowCelebration, markCelebrated, lottery.id]);

  return (
    <div className="min-h-screen bg-background pb-32">
      {shouldShowCelebration && (
        <WinnerCelebration onComplete={() => setCelebrationDismissed(true)} />
      )}

      {/* Header with image and status badge */}
      <LotteryHeader lottery={lottery} />

      {/* Content section */}
      <div className="mt-4 space-y-6">
        {/* Lottery info: title, description, prices */}
        <LotteryInfo lottery={lottery} />

        {/* Participation progress bar */}
        <ParticipationProgress lottery={lottery} onChainParticipants={contractData.participants} />

        {/* Seller info with WorldID badge */}
        <SellerInfo sellerAddress={lottery.seller} isVerified={true} />

        {/* Status-specific UI */}
        <LotteryStatusUI
          lottery={lottery}
          hasEntered={hasEntered}
          onOpenMarket={handleOpenMarket}
          openMarketStep={openMarketStep}
          onSettle={handleSettle}
          settleStep={settleStep}
          onClaimRefund={handleClaimRefund}
          claimRefundStep={claimRefundStep}
          onDraw={handleDraw}
          drawStep={drawStep}
          isSeller={role === 'seller'}
          contractData={contractData}
        />
      </div>

      {/* OpenMarket result dialog */}
      <OpenMarketResultDialog
        isSuccess={openMarketStep === 'success'}
        isError={openMarketStep === 'error'}
        errorMessage={openMarketError}
        onClose={handleOpenMarketResultClose}
        onRetry={handleOpenMarketRetry}
      />

      {/* Settle result dialog */}
      <SettlementResultDialog
        action="settle"
        isSuccess={settleStep === 'success'}
        isError={settleStep === 'error'}
        errorMessage={settleError}
        refundAmount={formatEther(PARTICIPANT_DEPOSIT) + ' WLD'}
        onClose={handleSettleResultClose}
        onRetry={handleSettleRetry}
      />

      {/* ClaimRefund result dialog */}
      <SettlementResultDialog
        action="claimRefund"
        isSuccess={claimRefundStep === 'success'}
        isError={claimRefundStep === 'error'}
        errorMessage={claimRefundError}
        refundAmount={getRefundAmountForDialog()}
        onClose={handleClaimRefundResultClose}
        onRetry={handleClaimRefundRetry}
      />

      {/* Draw result dialog */}
      <SettlementResultDialog
        action="settle"
        isSuccess={drawStep === 'success'}
        isError={drawStep === 'error'}
        errorMessage={drawError}
        refundAmount=""
        onClose={handleDrawResultClose}
        onRetry={handleDrawRetry}
      />

      {/* Entry CTA - only for OPEN status, not for seller */}
      {lottery.status === LotteryStatus.OPEN && role !== 'seller' && (
        <EntryButton
          lottery={lottery}
          participantAddresses={participantAddresses}
        />
      )}
    </div>
  );
}
