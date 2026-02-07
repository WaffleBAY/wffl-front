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
    // Always refresh after draw dialog (success or "already completed" error)
    router.refresh();
  };

  const handleDrawRetry = () => {
    resetDraw();
    router.refresh();
  };

  // On-chain contract data (participants, winners, status)
  const contractData = useLotteryContractData(lottery.contractAddress as Address | undefined);

  // Map on-chain status (number/bigint) to LotteryStatus enum, prefer on-chain over backend
  const effectiveStatus = useMemo(() => {
    if (contractData.status === undefined || contractData.status === null) return lottery.status;
    const statusNum = Number(contractData.status); // Handle bigint from wagmi
    const statusMap: Record<number, LotteryStatus> = {
      0: LotteryStatus.CREATED,
      1: LotteryStatus.OPEN,
      2: LotteryStatus.CLOSED,
      3: LotteryStatus.REVEALED,
      4: LotteryStatus.COMPLETED,
      5: LotteryStatus.FAILED,
    };
    return statusMap[statusNum] ?? lottery.status;
  }, [contractData.status, lottery.status]);

  // Create lottery with effective (on-chain) status for child components
  const effectiveLottery = useMemo(() => {
    if (effectiveStatus === lottery.status) return lottery;
    return { ...lottery, status: effectiveStatus };
  }, [lottery, effectiveStatus]);

  // Calculate refund amount for dialog based on status
  // FAILED: ticketPrice + participantDeposit (pool share)
  // COMPLETED: participantDeposit only
  const getRefundAmountForDialog = () => {
    if (effectiveStatus === LotteryStatus.FAILED) {
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

  // Compute hasEntered for status UI (prefer on-chain data)
  const hasEntered = useMemo(() => {
    if (!walletAddress) return false;
    // Check on-chain participants first
    if (contractData.participants && contractData.participants.length > 0) {
      return contractData.participants.some(
        (addr) => addr.toLowerCase() === walletAddress.toLowerCase()
      );
    }
    // Fallback to backend data
    if (participantAddresses.length > 0) {
      return participantAddresses.some(
        (addr) => addr.toLowerCase() === walletAddress.toLowerCase()
      );
    }
    return false;
  }, [walletAddress, participantAddresses, contractData.participants]);

  // Determine if celebration should show (derived state)
  const shouldShowCelebration = useMemo(() => {
    if (!celebrationHasHydrated) return false;
    if (celebrationDismissed) return false;

    const isWinningStatus = [
      LotteryStatus.REVEALED,
      LotteryStatus.COMPLETED,
    ].includes(effectiveStatus);

    return role === 'winner' && isWinningStatus && !hasCelebrated(lottery.id);
  }, [celebrationHasHydrated, celebrationDismissed, role, lottery.id, effectiveStatus, hasCelebrated]);

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
      <LotteryHeader lottery={effectiveLottery} />

      {/* Content section */}
      <div className="mt-4 space-y-6">
        {/* Lottery info: title, description, prices */}
        <LotteryInfo lottery={effectiveLottery} />

        {/* Participation progress bar */}
        <ParticipationProgress lottery={effectiveLottery} onChainParticipants={contractData.participants} onChainPrizePool={contractData.prizePool} />

        {/* Seller info with WorldID badge */}
        <SellerInfo sellerAddress={lottery.seller} isVerified={true} />

        {/* Status-specific UI */}
        <LotteryStatusUI
          lottery={effectiveLottery}
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
        action="draw"
        isSuccess={drawStep === 'success'}
        isError={drawStep === 'error'}
        errorMessage={drawError}
        refundAmount=""
        onClose={handleDrawResultClose}
        onRetry={handleDrawRetry}
      />

      {/* Entry CTA - only for OPEN status, not for seller */}
      {effectiveStatus === LotteryStatus.OPEN && role !== 'seller' && (
        <EntryButton
          lottery={effectiveLottery}
          participantAddresses={participantAddresses}
        />
      )}
    </div>
  );
}
