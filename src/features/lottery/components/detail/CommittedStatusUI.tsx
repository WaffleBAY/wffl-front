'use client';

import { Loader2, Shield } from 'lucide-react';
import type { Lottery } from '../../types/Lottery';

interface CommittedStatusUIProps {
  lottery: Lottery;
}

/**
 * UI for COMMITTED status - operator has committed secret, waiting for reveal
 * This is part of the commit-reveal randomness scheme
 */
export function CommittedStatusUI({ lottery }: CommittedStatusUIProps) {
  return (
    <div className="bg-amber-50 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-amber-700">
        <Shield className="w-5 h-5" />
        <span className="font-medium">추첨 준비 중</span>
      </div>

      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>

      <div className="space-y-2 text-sm text-amber-700">
        <p>
          공정한 추첨을 위해 비밀값이 제출되었습니다.
        </p>
        <p className="text-xs text-amber-600">
          블록 #{lottery.snapshotBlock} 이후 당첨자가 발표됩니다.
        </p>
      </div>

      <div className="bg-amber-100 rounded-lg p-3 text-xs text-amber-800">
        <p className="font-medium mb-1">Commit-Reveal 방식</p>
        <p>
          당첨자 조작을 방지하기 위해 비밀값을 먼저 제출(commit)한 후,
          특정 블록 이후에 공개(reveal)하는 방식을 사용합니다.
        </p>
      </div>
    </div>
  );
}
