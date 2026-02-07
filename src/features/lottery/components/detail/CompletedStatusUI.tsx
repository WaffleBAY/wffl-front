'use client';

import { CheckCircle, Trophy, Users, MessageCircle } from 'lucide-react';
import type { Lottery } from '../../types/Lottery';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { abbreviateAddress } from '@/features/auth/utils/address';
import { MarketType } from '../../types';
import { Button } from '@/components/ui/button';
import type { SettlementStep } from '../../hooks/useContractWrite';
import type { Address } from 'viem';
import { useParticipantInfo } from '../../hooks/useContractRead';
import { useUserProfile } from '@/features/user/hooks/useUserProfile';
import { generateWorldChatLink } from '../../utils/worldChatLink';

interface CompletedStatusUIProps {
  lottery: Lottery;
  contractData?: {
    participants?: readonly string[];
    winners?: readonly string[];
    status?: number;
  };
  onClaimRefund?: () => void;
  claimRefundStep?: SettlementStep;
}

function SellerChatSection({ sellerAddress }: { sellerAddress: string }) {
  const { profile, isLoading } = useUserProfile(sellerAddress);
  const username = profile?.username;

  return (
    <div className="bg-green-50 rounded-xl p-4 space-y-3 border border-green-200">
      <p className="text-sm text-green-700">
        축하합니다! 판매자에게 연락하여 경품 수령 방법을 확인하세요.
      </p>
      <Button
        variant="outline"
        className="w-full"
        disabled={isLoading || !username}
        onClick={() => {
          if (username) {
            window.open(generateWorldChatLink(username), '_blank');
          }
        }}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        {isLoading ? '로딩 중...' : !username ? '판매자 연락 불가' : '판매자에게 연락'}
      </Button>
    </div>
  );
}

function WinnerRow({ address, index, isMe, showChat }: { address: string; index: number; isMe: boolean; showChat: boolean }) {
  const { profile, isLoading } = useUserProfile(address);
  const username = profile?.username;

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg p-3">
      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-sm">
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
            window.open(generateWorldChatLink(username), '_blank');
          }}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          채팅
        </button>
      ) : null}
    </div>
  );
}

export function CompletedStatusUI({ lottery, contractData, onClaimRefund, claimRefundStep }: CompletedStatusUIProps) {
  const { walletAddress, isWalletConnected } = useAuthStore();

  // Use on-chain winners if available, fallback to lottery.winners
  const winners = contractData?.winners?.length
    ? Array.from(contractData.winners)
    : lottery.winners;

  const participants = contractData?.participants
    ? Array.from(contractData.participants)
    : [];

  const isWinner = walletAddress
    ? winners.some((w) => w.toLowerCase() === walletAddress.toLowerCase())
    : false;

  const hasEntered = walletAddress
    ? participants.some((p) => p.toLowerCase() === walletAddress.toLowerCase())
    : false;

  // Check on-chain participation and refund status
  const { hasEntered: onChainEntered, depositRefunded } = useParticipantInfo(
    lottery.contractAddress as Address | undefined,
    walletAddress as Address | undefined
  );

  const isSeller = walletAddress?.toLowerCase() === lottery.seller.toLowerCase();

  const isClaimProcessing = claimRefundStep === 'signing' || claimRefundStep === 'confirming';
  const canClaimRefund = (hasEntered || onChainEntered) && !depositRefunded;

  return (
    <div className="space-y-4">
      {/* Success icon */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />
        </div>
        <h3 className="mb-1 text-lg font-bold text-foreground">
          추첨이 완료되었습니다
        </h3>
        <p className="text-sm text-muted-foreground">{lottery.title}</p>
      </div>

      {/* Winners list */}
      {winners.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center gap-2 text-yellow-700 mb-3">
            <Trophy className="w-5 h-5" />
            <span className="font-bold">당첨자</span>
          </div>
          <div className="space-y-2">
            {winners.map((winner, index) => (
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
              {winners.length}명 당첨 / {lottery.preparedQuantity}개 경품
            </p>
          )}
        </div>
      )}

      {/* Participants list */}
      {participants.length > 0 && (
        <div className="bg-muted/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Users className="w-4 h-4" />
            <span className="font-medium text-sm">참여자 ({participants.length}명)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {participants.map((participant) => (
              <span
                key={participant}
                className={`text-xs font-mono px-2 py-1 rounded-full ${
                  isWalletConnected && participant.toLowerCase() === walletAddress?.toLowerCase()
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-background border'
                }`}
              >
                {isWalletConnected && participant.toLowerCase() === walletAddress?.toLowerCase()
                  ? '나'
                  : abbreviateAddress(participant)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Winner → Seller chat */}
      {isWinner && <SellerChatSection sellerAddress={lottery.seller} />}

      {/* Deposit refund button */}
      {canClaimRefund && (
        <div className="bg-blue-50 rounded-xl p-4 space-y-3 border border-blue-200">
          <p className="text-sm text-blue-700">
            보증금을 환불받으실 수 있습니다.
          </p>
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={onClaimRefund}
            disabled={isClaimProcessing || claimRefundStep === 'success'}
          >
            {isClaimProcessing ? '처리 중...' : claimRefundStep === 'success' ? '환불 완료!' : '보증금 환불'}
          </Button>
        </div>
      )}
    </div>
  );
}
