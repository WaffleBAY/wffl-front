export enum NotificationType {
  WIN = 'WIN',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  ENTRY_CONFIRMED = 'ENTRY_CONFIRMED',
  REFUND = 'REFUND',
  SALE_COMPLETE = 'SALE_COMPLETE',
}

export const NOTIFICATION_MESSAGES: Record<NotificationType, string> = {
  [NotificationType.WIN]: '당첨됨',
  [NotificationType.SHIPPED]: '배송 시작',
  [NotificationType.DELIVERED]: '배송 완료',
  [NotificationType.ENTRY_CONFIRMED]: '응모 완료',
  [NotificationType.REFUND]: '환불 가능',
  [NotificationType.SALE_COMPLETE]: '판매 완료',
};

export interface Notification {
  id: string;
  type: NotificationType;
  lotteryId: string | null;
  lotteryTitle?: string; // Optional, for backward compatibility
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface NotificationListResponse {
  items: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
