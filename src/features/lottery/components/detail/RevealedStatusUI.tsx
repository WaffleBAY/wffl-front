'use client';

import { Trophy, PartyPopper, Check, MessageCircle } from 'lucide-react';
import type { Address } from 'viem';
import type { Lottery } from '../../types/Lottery';
import { MarketType, isUserWinner } from '../../types';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { abbreviateAddress } from '@/features/auth/utils/address';
import { generateWorldChatLink } from '../../utils/worldChatLink';
import { useUserProfile } from '@/features/user/hooks/useUserProfile';
import { useParticipantInfo } from '../../hooks/useContractRead';
import type { SettlementStep } from '../../hooks/useContractWrite';

interface RevealedStatusUIProps {
  lottery: Lottery;
  onConfirmReceipt?: () => void;
  confirmReceiptStep?: SettlementStep;
  onClaimRefund?: () => void;
  claimRefundStep?: SettlementStep;
}

/**
 * UI for REVEALED status - winner(s) selected, waiting for confirmation
 * Winner can confirm receipt to complete the market
 * Non-winners can claim their deposit refund
 */
export function RevealedStatusUI({
  lottery,
  onConfirmReceipt,
  confirmReceiptStep,
  onClaimRefund,
  claimRefundStep,
}: RevealedStatusUIProps) {
  const { walletAddress, isWalletConnected } = useAuthStore();
  const isWinner = walletAddress ? isUserWinner(lottery, walletAddress) : false;
  const isSeller = walletAddress?.toLowerCase() === lottery.seller.toLowerCase();

  // Get participation info from contract
  const { hasEntered, depositRefunded } = useParticipantInfo(
    lottery.contractAddress as Address | undefined,
    walletAddress as Address | undefined
  );

  const { profile: sellerProfile } = useUserProfile(lottery.seller);
  const sellerUsername = sellerProfile?.username;

  // Loading state checks
  const isConfirmReceiptProcessing = confirmReceiptStep === 'signing' || confirmReceiptStep === 'confirming';
  const isClaimRefundProcessing = claimRefundStep === 'signing' || claimRefundStep === 'confirming';

  return (
    <div className="space-y-4">
      {/* Winner announcement */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
        <div className="flex items-center gap-2 text-yellow-700 mb-3">
          <Trophy className="w-5 h-5" />
          <span className="font-bold">당첨자 발표</span>
        </div>

        <div className="space-y-2">
          {lottery.winners.map((winner, index) => (
            <div
              key={winner}
              className="flex items-center gap-2 bg-white rounded-lg p-3"
            >
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold">
                {index + 1}
              </div>
              <span className="font-mono text-sm">
                {abbreviateAddress(winner)}
              </span>
              {isWalletConnected && winner.toLowerCase() === walletAddress?.toLowerCase() && (
                <span className="ml-auto text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                  나
                </span>
              )}
            </div>
          ))}
        </div>

        {lottery.marketType === MarketType.RAFFLE && (
          <p className="text-xs text-yellow-600 mt-2">
            {lottery.winners.length}명 당첨 / {lottery.preparedQuantity}개 경품
          </p>
        )}
      </div>

      {/* Winner actions */}
      {isWinner && (
        <div className="bg-green-50 rounded-xl p-4 space-y-3 border border-green-200">
          <div className="flex items-center gap-2 text-green-700">
            <PartyPopper className="w-5 h-5" />
            <span className="font-medium">축하합니다! 당첨되셨습니다!</span>
          </div>

          <p className="text-sm text-green-600">
            판매자에게 연락하여 경품 수령 방법을 확인하세요.
            경품을 받으신 후 아래 버튼을 눌러 수령을 확인해주세요.
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                if (sellerUsername) {
                  window.open(generateWorldChatLink(sellerUsername), '_blank');
                }
              }}
              disabled={!sellerUsername}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              판매자 연락
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={onConfirmReceipt}
              disabled={confirmReceiptStep !== 'idle' && confirmReceiptStep !== undefined || depositRefunded}
            >
              <Check className="w-4 h-4 mr-2" />
              {isConfirmReceiptProcessing ? '처리 중...' : '수령 확인'}
            </Button>
          </div>

          <p className="text-xs text-green-500">
            수령 확인 시 보증금 {lottery.participantDeposit} ETH가 반환됩니다.
          </p>
        </div>
      )}

      {/* Non-winner refund - hide if already refunded */}
      {!isWinner && hasEntered && !isSeller && !depositRefunded && (
        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
          <p className="text-sm text-slate-600">
            아쉽게도 이번에는 당첨되지 않았습니다.
            보증금을 환불받으실 수 있습니다.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={onClaimRefund}
            disabled={claimRefundStep !== 'idle' && claimRefundStep !== undefined}
          >
            {isClaimRefundProcessing ? '처리 중...' : `보증금 환불받기 (${lottery.participantDeposit} ETH)`}
          </Button>
        </div>
      )}

      {/* Seller view */}
      {isSeller && (
        <div className="bg-blue-50 rounded-xl p-4 space-y-3">
          <p className="text-sm text-blue-700">
            당첨자가 수령 확인을 완료하면 상금이 정산됩니다.
            당첨자에게 연락하여 경품 배송을 진행해주세요.
          </p>
        </div>
      )}
    </div>
  );
}
