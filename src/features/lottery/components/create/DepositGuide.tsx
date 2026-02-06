'use client';

import { Info } from 'lucide-react';
import { MarketType } from '../../types';

interface DepositGuideProps {
  targetAmount: number;
  marketType: MarketType;
}

export function DepositGuide({ targetAmount, marketType }: DepositGuideProps) {
  // Don't show if targetAmount is not set
  if (!targetAmount || targetAmount <= 0) {
    return null;
  }

  // LOTTERY: No seller deposit required
  if (marketType === MarketType.LOTTERY) {
    return (
      <div className="flex items-start gap-2 p-3 bg-green-50 text-green-800 rounded-lg text-sm">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">보증금 안내</p>
          <p className="mt-1">
            LOTTERY 타입은 판매자 보증금이 필요하지 않습니다.
          </p>
        </div>
      </div>
    );
  }

  // RAFFLE: Fixed 15% seller deposit
  const deposit = targetAmount * 0.15;

  return (
    <div className="flex items-start gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
      <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-medium">보증금 안내</p>
        <p className="mt-1">
          예상 보증금: {deposit.toFixed(2)} WLD (목표금액의 15%)
        </p>
        <p className="text-xs text-blue-600 mt-1">
          정상 거래 완료 시 반환됩니다.
        </p>
      </div>
    </div>
  );
}
