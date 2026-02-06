'use client';

import { LotteryStatus } from '../../types/LotteryStatus';
import type { Lottery } from '../../types/Lottery';
import type { OpenMarketStep, SettlementStep } from '../../hooks/useContractWrite';
import { CreatedStatusUI } from './CreatedStatusUI';
import { OpenStatusUI } from './OpenStatusUI';
import { ClosedStatusUI } from './ClosedStatusUI';
import { CommittedStatusUI } from './CommittedStatusUI';
import { RevealedStatusUI } from './RevealedStatusUI';
import { CompletedStatusUI } from './CompletedStatusUI';
import { FailedStatusUI } from './FailedStatusUI';

interface LotteryStatusUIProps {
  lottery: Lottery;
  hasEntered: boolean;
  onOpenMarket?: () => void;
  openMarketStep?: OpenMarketStep;
  onConfirmReceipt?: () => void;
  confirmReceiptStep?: SettlementStep;
  onClaimRefund?: () => void;
  claimRefundStep?: SettlementStep;
}

/**
 * Status-based UI renderer for lottery detail page
 * Renders the appropriate UI component based on lottery status
 *
 * Status flow: CREATED → OPEN → CLOSED → COMMITTED → REVEALED → COMPLETED
 *                                  ↘ FAILED ↙
 */
export function LotteryStatusUI({
  lottery,
  hasEntered,
  onOpenMarket,
  openMarketStep,
  onConfirmReceipt,
  confirmReceiptStep,
  onClaimRefund,
  claimRefundStep,
}: LotteryStatusUIProps) {
  const renderStatusUI = () => {
    switch (lottery.status) {
      case LotteryStatus.CREATED:
        return <CreatedStatusUI lottery={lottery} onOpenMarket={onOpenMarket} openMarketStep={openMarketStep} />;
      case LotteryStatus.OPEN:
        return <OpenStatusUI lottery={lottery} hasEntered={hasEntered} />;
      case LotteryStatus.CLOSED:
        return <ClosedStatusUI lottery={lottery} />;
      case LotteryStatus.COMMITTED:
        return <CommittedStatusUI lottery={lottery} />;
      case LotteryStatus.REVEALED:
        return (
          <RevealedStatusUI
            lottery={lottery}
            onConfirmReceipt={onConfirmReceipt}
            confirmReceiptStep={confirmReceiptStep}
            onClaimRefund={onClaimRefund}
            claimRefundStep={claimRefundStep}
          />
        );
      case LotteryStatus.COMPLETED:
        return <CompletedStatusUI lottery={lottery} />;
      case LotteryStatus.FAILED:
        return <FailedStatusUI lottery={lottery} onClaimRefund={onClaimRefund} claimRefundStep={claimRefundStep} />;
      default:
        // Unknown status - return null for future extensibility
        return null;
    }
  };

  const content = renderStatusUI();
  if (!content) return null;

  return <div className="px-4">{content}</div>;
}
