'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { fetchNotifications } from '../api/notificationApi';

/**
 * Hook that syncs notifications from backend to local store.
 * Polls every 30 seconds when user is authenticated.
 */
export function useNotificationSync() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = !!accessToken;
  const { setNotifications, notifications } = useNotificationStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotifications({ limit: 50 }),
    enabled: isAuthenticated,
    refetchInterval: 30_000, // 30 seconds per v5.0 decision
    refetchIntervalInBackground: false, // Pause when tab inactive
    staleTime: 25_000, // Consider data stale after 25s
  });

  // Sync fetched notifications to store
  useEffect(() => {
    if (data?.items) {
      // Replace store notifications with backend data (source of truth)
      setNotifications(data.items);
    }
  }, [data, setNotifications]);

  return {
    notifications: data?.items ?? notifications,
    isLoading,
    error,
  };
}
