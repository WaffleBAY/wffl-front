'use client';

import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Lottery, MarketType } from '../../types';
import { formatWLD } from '../../utils/formatters';
import { abbreviateAddress } from '@/features/auth/utils/address';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

interface ParticipationProgressProps {
  lottery: Lottery;
  onChainParticipants?: readonly string[];
}

export function ParticipationProgress({ lottery, onChainParticipants }: ParticipationProgressProps) {
  const [showParticipants, setShowParticipants] = useState(false);
  const { walletAddress, isWalletConnected } = useAuthStore();
  const isRaffle = lottery.marketType === MarketType.RAFFLE;

  const goalBigInt = BigInt(lottery.goalAmount);
  const progressPercent = isRaffle
    ? Math.min((lottery.participantCount / lottery.preparedQuantity) * 100, 100)
    : goalBigInt > BigInt(0)
      ? Math.min(
          (Number(BigInt(lottery.prizePool)) / Number(goalBigInt)) * 100,
          100
        )
      : 0;

  const participants = onChainParticipants ? Array.from(onChainParticipants) : [];

  return (
    <div className="space-y-3 px-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">참여 현황</span>
        <span className="font-medium text-foreground">
          {progressPercent.toFixed(0)}%
        </span>
      </div>

      <Progress value={progressPercent} className="h-3" />

      <div className="flex items-center justify-between text-sm">
        {isRaffle ? (
          <span className="text-muted-foreground">
            {lottery.participantCount} / {lottery.preparedQuantity}명
          </span>
        ) : (
          <span className="text-muted-foreground">
            {formatWLD(lottery.prizePool)} / {formatWLD(lottery.goalAmount)} WLD
          </span>
        )}
        <span className="font-medium text-foreground">
          총 {lottery.participantCount}명 참여
        </span>
      </div>

      {/* On-chain participant list (collapsible) */}
      {participants.length > 0 && (
        <div>
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            참여자 목록
            {showParticipants ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
          {showParticipants && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {participants.map((participant) => (
                <span
                  key={participant}
                  className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                    isWalletConnected && participant.toLowerCase() === walletAddress?.toLowerCase()
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'bg-muted border border-border'
                  }`}
                >
                  {isWalletConnected && participant.toLowerCase() === walletAddress?.toLowerCase()
                    ? '나'
                    : abbreviateAddress(participant)}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
