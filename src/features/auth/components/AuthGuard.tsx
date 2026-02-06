'use client';

import { ReactNode } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { LoginBottomSheet } from './LoginBottomSheet';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isWalletConnected, isWorldIdVerified, isDevMode, _hasHydrated } = useAuthStore();

  const isFullyAuthenticated = isDevMode || (isWalletConnected && isWorldIdVerified);

  // Prevent hydration mismatch by not rendering until store is hydrated
  if (!_hasHydrated) {
    return null;
  }

  return (
    <>
      {children}
      <LoginBottomSheet isOpen={!isFullyAuthenticated} />
    </>
  );
}
