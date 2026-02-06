'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useNotificationStore, selectUnreadCount } from '@/features/notifications/store/useNotificationStore';
import { useNotificationSync } from '@/features/notifications/hooks/useNotificationSync';
import { NotificationItem } from '@/features/notifications/components';
import { Button } from '@/components/ui/button';
import { markAllNotificationsAsRead, markNotificationAsRead } from '@/features/notifications/api/notificationApi';
import { useQueryClient } from '@tanstack/react-query';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { notifications, isLoading } = useNotificationSync();
  const unreadCount = useNotificationStore(selectUnreadCount);
  const markAsRead = useNotificationStore((state) => state.markAsRead);

  const handleMarkAsRead = async (id: string) => {
    // Optimistic update
    markAsRead(id);
    // Sync to backend
    try {
      await markNotificationAsRead([id]);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    // Optimistic update
    useNotificationStore.getState().markAllAsRead();
    // Sync to backend
    try {
      await markAllNotificationsAsRead();
      // Invalidate cache to refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Empty callback for onClose since we're not in a popover
  const handleClose = () => {};

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              className="p-2 -ml-2 rounded-full hover:bg-accent transition-colors"
              aria-label="뒤로 가기"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-semibold">알림</h1>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-sm"
            >
              모두 읽음
            </Button>
          )}
        </div>
      </header>

      {/* Notification list */}
      <main>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            로딩 중...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            알림이 없습니다
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <div key={notification.id} className="px-1">
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onClose={handleClose}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
