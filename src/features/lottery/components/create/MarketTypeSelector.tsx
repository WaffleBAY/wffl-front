'use client';

import { MarketType } from '../../types';

interface MarketTypeSelectorProps {
  value: MarketType;
  onChange: (value: MarketType) => void;
}

export function MarketTypeSelector({ value, onChange }: MarketTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
        <input
          type="radio"
          name="marketType"
          value={MarketType.LOTTERY}
          checked={value === MarketType.LOTTERY}
          onChange={() => onChange(MarketType.LOTTERY)}
          className="mt-1"
        />
        <div>
          <div className="font-medium">LOTTERY (1인 당첨)</div>
          <div className="text-sm text-muted-foreground">
            목표액 달성 시 1인 당첨
          </div>
        </div>
      </label>

      <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
        <input
          type="radio"
          name="marketType"
          value={MarketType.RAFFLE}
          checked={value === MarketType.RAFFLE}
          onChange={() => onChange(MarketType.RAFFLE)}
          className="mt-1"
        />
        <div>
          <div className="font-medium">RAFFLE (다수 당첨)</div>
          <div className="text-sm text-muted-foreground">
            준비 수량만큼 당첨
          </div>
        </div>
      </label>
    </div>
  );
}
