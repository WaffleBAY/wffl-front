'use client';

import { useAuth } from '../hooks/useAuth';

/**
 * LogoutButton component for signing out
 * - Calls logout function from useAuth hook
 * - Styled with red/danger colors
 * - After logout, AuthGuard will automatically show LoginBottomSheet
 */
export function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button
      type="button"
      onClick={logout}
      className="w-full rounded-xl bg-red-50 py-3 text-red-600 transition-colors hover:bg-red-100"
    >
      로그아웃
    </button>
  );
}
