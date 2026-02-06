'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNotificationStore, selectUnreadCount } from '../store/useNotificationStore';
import { NotificationPanel } from './NotificationPanel';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const hasHydrated = useNotificationStore((state) => state._hasHydrated);
  const unreadCount = useNotificationStore(selectUnreadCount);

  // Format badge count (max 9+)
  const displayCount = unreadCount > 9 ? '9+' : unreadCount.toString();
  const showBadge = hasHydrated && unreadCount > 0;

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative p-2 rounded-full hover:bg-accent transition-colors"
          aria-label={`알림 ${unreadCount}개`}
        >
          <Bell className="h-5 w-5" />
          {showBadge && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-medium text-destructive-foreground bg-destructive rounded-full px-1">
              {displayCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-4">
        <NotificationPanel onClose={handleClose} />
      </PopoverContent>
    </Popover>
  );
}
