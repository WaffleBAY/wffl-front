'use client';

import Link from 'next/link';
import { Trophy, Truck, Package, CheckCircle, RefreshCw, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notification, NotificationType, NOTIFICATION_MESSAGES } from '../types';
import { formatRelativeTime } from '../utils/formatters';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
}

const notificationIcons: Record<NotificationType, React.ElementType> = {
  [NotificationType.WIN]: Trophy,
  [NotificationType.SHIPPED]: Truck,
  [NotificationType.DELIVERED]: Package,
  [NotificationType.ENTRY_CONFIRMED]: CheckCircle,
  [NotificationType.REFUND]: RefreshCw,
  [NotificationType.SALE_COMPLETE]: DollarSign,
};

const iconColors: Record<NotificationType, string> = {
  [NotificationType.WIN]: 'text-yellow-500',
  [NotificationType.SHIPPED]: 'text-blue-500',
  [NotificationType.DELIVERED]: 'text-green-500',
  [NotificationType.ENTRY_CONFIRMED]: 'text-primary',
  [NotificationType.REFUND]: 'text-orange-500',
  [NotificationType.SALE_COMPLETE]: 'text-emerald-500',
};

export function NotificationItem({
  notification,
  onMarkAsRead,
  onClose,
}: NotificationItemProps) {
  const Icon = notificationIcons[notification.type];
  const iconColor = iconColors[notification.type];
  const typeLabel = NOTIFICATION_MESSAGES[notification.type];

  const handleClick = () => {
    onMarkAsRead(notification.id);
    onClose();
  };

  // Use title from notification, fall back to lotteryTitle for backward compatibility
  const displayTitle = notification.title || notification.lotteryTitle || '';

  // Link to lottery detail if lotteryId exists, otherwise home
  const href = notification.lotteryId
    ? `/lottery/${notification.lotteryId}`
    : '/home';

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        'flex items-start gap-3 p-3 rounded-md transition-colors hover:bg-accent',
        !notification.isRead && 'bg-accent/30'
      )}
    >
      <div className={cn('mt-0.5 flex-shrink-0', iconColor)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {displayTitle}
        </p>
        <p className="text-xs text-muted-foreground">
          {typeLabel} · {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
      {!notification.isRead && (
        <div className="flex-shrink-0 mt-2">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
        </div>
      )}
    </Link>
  );
}
