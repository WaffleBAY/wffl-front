import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Notification } from '../types';

const MAX_NOTIFICATIONS = 50;

interface NotificationState {
  notifications: Notification[];
  _hasHydrated: boolean;
}

interface NotificationActions {
  addNotification: (notification: Notification) => void;
  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setHasHydrated: (state: boolean) => void;
}

type NotificationStore = NotificationState & NotificationActions;

const initialState: NotificationState = {
  notifications: [],
  _hasHydrated: false,
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      ...initialState,
      addNotification: (notification: Notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications].slice(0, MAX_NOTIFICATIONS),
        })),
      setNotifications: (notifications: Notification[]) =>
        set({ notifications }),
      markAsRead: (id: string) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),
      setHasHydrated: (state: boolean) =>
        set({
          _hasHydrated: state,
        }),
    }),
    {
      name: 'world-lottery-notifications',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        notifications: state.notifications,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Selector for unread count - use this to avoid stale closure issues
export const selectUnreadCount = (state: NotificationStore): number =>
  state.notifications.filter((n) => !n.isRead).length;
