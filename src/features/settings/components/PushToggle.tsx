'use client';

import { Bell, BellOff } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';

export function PushToggle() {
  const { pushEnabled, setPushEnabled, _hasHydrated } = useSettingsStore();

  // Wait for hydration to avoid SSR mismatch
  if (!_hasHydrated) {
    return null;
  }

  return (
    <div className="flex items-center justify-between rounded-xl bg-card p-4">
      <div className="flex items-center gap-3">
        {pushEnabled ? (
          <Bell className="h-5 w-5 text-primary" />
        ) : (
          <BellOff className="h-5 w-5 text-muted-foreground" />
        )}
        <div>
          <p className="font-medium">푸시 알림</p>
          <p className="text-sm text-muted-foreground">당첨, 배송 알림을 받습니다</p>
        </div>
      </div>
      <button
        role="switch"
        aria-checked={pushEnabled}
        onClick={() => setPushEnabled(!pushEnabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          pushEnabled ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
            pushEnabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
