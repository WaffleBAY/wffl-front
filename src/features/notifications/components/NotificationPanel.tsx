'use client';

import Link from 'next/link';
import { useNotificationStore } from '../store/useNotificationStore';
import { NotificationItem } from './NotificationItem';

interface NotificationPanelProps {
  onClose: () => void;
}

const MAX_VISIBLE_NOTIFICATIONS = 5;

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  const visibleNotifications = notifications.slice(0, MAX_VISIBLE_NOTIFICATIONS);
  const hasNotifications = notifications.length > 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b">
        <h3 className="font-semibold text-sm">알림</h3>
        {hasNotifications && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            모두 읽음
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="max-h-[280px] overflow-y-auto -mx-1">
        {hasNotifications ? (
          <div className="space-y-1 px-1">
            {visibleNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onClose={onClose}
              />
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-muted-foreground">
            알림이 없습니다
          </div>
        )}
      </div>

      {/* Footer */}
      {hasNotifications && (
        <div className="mt-2 pt-2 border-t">
          <Link
            href="/notifications"
            onClick={onClose}
            className="block text-center text-sm text-primary hover:underline"
          >
            모두 보기
          </Link>
        </div>
      )}
    </div>
  );
}
