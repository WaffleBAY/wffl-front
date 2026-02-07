'use client';

import { NotificationBell } from '@/features/notifications/components';

export function Header() {
  return (
    <header className="sticky top-0 z-40 header-gradient">
      <div className="flex items-center justify-between h-14 px-4">
        <h1 className="text-xl header-title">WFFL</h1>
        <NotificationBell />
      </div>
    </header>
  );
}
