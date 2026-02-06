'use client';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import type { Lottery } from '../types';

export type UserRole = 'seller' | 'winner' | 'viewer' | 'guest';

/**
 * Determines user's role relative to a lottery
 * - seller: user is the lottery creator
 * - winner: user is in the winners list
 * - viewer: user is authenticated but not seller/winner
 * - guest: user is not authenticated (or hydration incomplete)
 */
export function useUserRole(lottery: Lottery): UserRole {
  const walletAddress = useAuthStore((state) => state.walletAddress);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);

  // Safe default during SSR/hydration
  if (!_hasHydrated) {
    return 'guest';
  }

  // Not authenticated
  if (!walletAddress) {
    return 'guest';
  }

  const normalizedAddress = walletAddress.toLowerCase();

  // Check if user is the seller
  if (normalizedAddress === lottery.seller.toLowerCase()) {
    return 'seller';
  }

  // Check if user is a winner (case-insensitive comparison)
  if (lottery.winners?.some((w) => w.toLowerCase() === normalizedAddress)) {
    return 'winner';
  }

  // Authenticated but not seller/winner
  return 'viewer';
}
