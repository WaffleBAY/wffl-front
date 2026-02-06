import apiClient from '@/lib/api/client';
import type { NotificationListResponse } from '../types';

export async function fetchNotifications(params?: {
  page?: number;
  limit?: number;
}): Promise<NotificationListResponse> {
  const response = await apiClient.get<NotificationListResponse>(
    '/users/me/notifications',
    { params: { page: params?.page ?? 1, limit: params?.limit ?? 50 } }
  );
  return response.data;
}

export async function markNotificationAsRead(
  notificationIds: string[]
): Promise<void> {
  await apiClient.patch('/users/me/notifications/read', { notificationIds });
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await apiClient.patch('/users/me/notifications/read-all');
}
