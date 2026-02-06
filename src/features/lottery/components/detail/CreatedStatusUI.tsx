'use client';

import { Clock } from 'lucide-react';
import type { Lottery } from '../../types/Lottery';
import type { OpenMarketStep } from '../../hooks/useContractWrite';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { Button } from '@/components/ui/button';

interface CreatedStatusUIProps {
  lottery: Lottery;
  onOpenMarket?: () => void;
  openMarketStep?: OpenMarketStep;
}

function getButtonText(step: OpenMarketStep | undefined): string {
  switch (step) {
    case 'signing':
      return '서명 중...';
    case 'confirming':
      return '확인 대기 중...';
    default:
      return '마켓 열기';
  }
}

function isButtonDisabled(step: OpenMarketStep | undefined): boolean {
  return step !== undefined && step !== 'idle';
}

/**
 * UI for CREATED status - market created but not yet open
 * Only seller can open the market
 */
export function CreatedStatusUI({ lottery, onOpenMarket, openMarketStep }: CreatedStatusUIProps) {
  const { walletAddress } = useAuthStore();
  const isSeller = walletAddress?.toLowerCase() === lottery.seller.toLowerCase();

  return (
    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-slate-600">
        <Clock className="w-5 h-5" />
        <span className="font-medium">마켓 생성됨</span>
      </div>

      {isSeller ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            마켓이 생성되었습니다. 응모를 시작하려면 마켓을 열어주세요.
          </p>
          <Button
            onClick={onOpenMarket}
            disabled={isButtonDisabled(openMarketStep)}
            className="w-full"
          >
            {getButtonText(openMarketStep)}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          판매자가 아직 마켓을 열지 않았습니다. 잠시 후 다시 확인해주세요.
        </p>
      )}
    </div>
  );
}
