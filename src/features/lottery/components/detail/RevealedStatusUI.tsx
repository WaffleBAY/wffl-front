'use client';

import { Trophy, PartyPopper, Check } from 'lucide-react';
import type { Address } from 'viem';
import type { Lottery } from '../../types/Lottery';
import { MarketType, isUserWinner } from '../../types';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { abbreviateAddress } from '@/features/auth/utils/address';
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

function WinnerRow({ address, index, isMe }: { address: string; index: number; isMe: boolean }) {
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
      {isMe && (
        <span className="ml-auto text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
          나
        </span>
      )}
    </div>
  );
}

export function RevealedStatusUI({
  lottery,
  onSettle,
  settleStep,
}: RevealedStatusUIProps) {
  const { walletAddress, isWalletConnected } = useAuthStore();
  const isWinner = walletAddress ? isUserWinner(lottery, walletAddress) : false;
  const isSeller = walletAddress?.toLowerCase() === lottery.seller.toLowerCase();

  // Get participation info from contract
  const { hasEntered } = useParticipantInfo(
    lottery.contractAddress as Address | undefined,
    walletAddress as Address | undefined
  );

  // Loading state checks
  const isSettleProcessing = settleStep === 'signing' || settleStep === 'confirming';

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
            />
          ))}
        </div>

        {lottery.marketType === MarketType.RAFFLE && (
          <p className="text-xs text-yellow-600 mt-2">
            {lottery.winners.length}명 당첨 / {lottery.preparedQuantity}개 경품
          </p>
        )}
      </div>

      {/* Winner congratulations */}
      {isWinner && (
        <div className="bg-green-50 rounded-xl p-4 space-y-3 border border-green-200">
          <div className="flex items-center gap-2 text-green-700">
            <PartyPopper className="w-5 h-5" />
            <span className="font-medium">축하합니다! 당첨되셨습니다!</span>
          </div>
          <p className="text-sm text-green-600">
            정산 완료 후 경품 수령 안내가 진행됩니다.
          </p>
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
