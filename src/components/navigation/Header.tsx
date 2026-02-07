'use client';

import { NotificationBell } from '@/features/notifications/components';

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
        <h1 className="text-lg font-semibold">World Raffle</h1>
        <NotificationBell />
      </div>
    </header>
  );
}
