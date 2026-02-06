'use client';

import { XCircle, RefreshCcw } from 'lucide-react';
import type { Lottery } from '../../types/Lottery';
import type { Address } from 'viem';
import { MarketType } from '../../types';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { formatEther } from 'viem';
import { useParticipantInfo } from '../../hooks/useContractRead';
import type { SettlementStep } from '../../hooks/useContractWrite';

interface FailedStatusUIProps {
  lottery: Lottery;
  onClaimRefund?: () => void;
  claimRefundStep?: SettlementStep;
}

/**
 * UI for FAILED status - market failed (goal not reached or timeout)
 * Participants can claim full refund
 */
export function FailedStatusUI({ lottery, onClaimRefund, claimRefundStep }: FailedStatusUIProps) {
  const { walletAddress, isWalletConnected } = useAuthStore();
  const isSeller = walletAddress?.toLowerCase() === lottery.seller.toLowerCase();

  // Get participation info from contract
  const { hasEntered, depositRefunded } = useParticipantInfo(
    lottery.contractAddress as Address | undefined,
    walletAddress as Address | undefined
  );

  // Loading state check
  const isClaimRefundProcessing = claimRefundStep === 'signing' || claimRefundStep === 'confirming';

  // Calculate how much user can refund
  const refundAmount = hasEntered
    ? BigInt(lottery.ticketPrice) + BigInt(lottery.participantDeposit)
    : BigInt(0);

  const failureReason = lottery.marketType === MarketType.LOTTERY
    ? `목표 금액 ${formatEther(BigInt(lottery.goalAmount))} ETH에 도달하지 못했습니다.`
    : '추첨 제한 시간이 초과되었습니다.';

  return (
    <div className="space-y-4">
      {/* Failure notice */}
      <div className="bg-red-50 rounded-xl p-4 space-y-3 border border-red-200">
        <div className="flex items-center gap-2 text-red-700">
          <XCircle className="w-5 h-5" />
          <span className="font-medium">마켓 종료</span>
        </div>

        <p className="text-sm text-red-600">{failureReason}</p>

        <div className="bg-white rounded-lg p-3 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>모금액</span>
            <span>{formatEther(BigInt(lottery.prizePool))} ETH</span>
          </div>
          {lottery.marketType === MarketType.LOTTERY && (
            <div className="flex justify-between text-slate-600 mt-1">
              <span>목표액</span>
              <span>{formatEther(BigInt(lottery.goalAmount))} ETH</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600 mt-1">
            <span>참여자</span>
            <span>{lottery.participantCount}명</span>
          </div>
        </div>
      </div>

      {/* Refund for participants - hide if already refunded */}
      {isWalletConnected && hasEntered && !isSeller && !depositRefunded && (
        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-slate-700">
            <RefreshCcw className="w-5 h-5" />
            <span className="font-medium">환불 가능</span>
          </div>

          <p className="text-sm text-slate-600">
            마켓이 실패하여 참가비 전액을 환불받으실 수 있습니다.
          </p>

          <div className="bg-white rounded-lg p-3">
            <div className="flex justify-between font-medium">
              <span>환불 금액</span>
              <span>{formatEther(refundAmount)} ETH</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              티켓 가격 + 보증금
            </p>
          </div>

          <Button
            className="w-full"
            onClick={onClaimRefund}
            disabled={claimRefundStep !== 'idle' && claimRefundStep !== undefined}
          >
            {isClaimRefundProcessing ? '처리 중...' : '환불받기'}
          </Button>
        </div>
      )}

      {/* Seller view */}
      {isSeller && (
        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
          <p className="text-sm text-slate-600">
            마켓이 목표에 도달하지 못해 종료되었습니다.
            {lottery.marketType === MarketType.RAFFLE && (
              <span> 판매자 보증금은 자동으로 반환됩니다.</span>
            )}
          </p>
        </div>
      )}

      {/* Guest view */}
      {!isWalletConnected && (
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-sm text-slate-500">
            이 마켓은 종료되었습니다.
          </p>
        </div>
      )}
    </div>
  );
}
