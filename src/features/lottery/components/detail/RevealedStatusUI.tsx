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
  onSettle?: () => void;
  settleStep?: SettlementStep;
  onClaimRefund?: () => void;
  claimRefundStep?: SettlementStep;
}

function WinnerRow({ address, index, isMe, showChat }: { address: string; index: number; isMe: boolean; showChat: boolean }) {
  const { profile, isLoading } = useUserProfile(address);
  const username = profile?.username;

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg p-3">
      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold">
        {index + 1}
      </div>
      <span className="text-sm">
        {isLoading ? abbreviateAddress(address) : username ? `@${username}` : abbreviateAddress(address)}
      </span>
      {isMe ? (
        <span className="ml-auto text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
          나
        </span>
      ) : showChat && username ? (
        <button
          className="ml-auto shrink-0 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded-md hover:bg-blue-50"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = generateWorldChatLink(username);
          }}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          채팅
        </button>
      ) : null}
    </div>
  );
}

export function RevealedStatusUI({
  lottery,
  onSettle,
  settleStep,
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
  const isSettleProcessing = settleStep === 'signing' || settleStep === 'confirming';
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
            <WinnerRow
              key={winner}
              address={winner}
              index={index}
              isMe={isWalletConnected && winner.toLowerCase() === walletAddress?.toLowerCase()}
              showChat={isSeller}
            />
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
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                if (sellerUsername) {
                  window.location.href = generateWorldChatLink(sellerUsername);
                }
              }}
              disabled={!sellerUsername}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              판매자 연락
            </Button>
          </div>
        </div>
      )}

      {/* Settlement button - anyone can call settle */}
      <div className="bg-blue-50 rounded-xl p-4 space-y-3 border border-blue-200">
        <p className="text-sm text-blue-700">
          정산을 실행하여 마켓을 완료할 수 있습니다.
        </p>
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={onSettle}
          disabled={settleStep !== 'idle' && settleStep !== undefined}
        >
          <Check className="w-4 h-4 mr-2" />
          {isSettleProcessing ? '처리 중...' : '정산 실행'}
        </Button>
      </div>

      {/* Non-winner refund note */}
      {!isWinner && hasEntered && !isSeller && (
        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
          <p className="text-sm text-slate-600">
            아쉽게도 이번에는 당첨되지 않았습니다.
            정산 완료 후 보증금을 환불받으실 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}
