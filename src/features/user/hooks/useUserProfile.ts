'use client';

import { MiniKit } from '@worldcoin/minikit-js';
import { useState, useEffect } from 'react';
import type { UserProfile } from '../types/UserProfile';

/**
 * Module-level cache for resolved profiles
 * Persists across component mounts to avoid redundant API calls
 */
const profileCache = new Map<string, UserProfile>();

/**
 * Module-level map for pending requests (request deduplication)
 * Prevents parallel calls for the same address
 */
const pendingRequests = new Map<string, Promise<UserProfile>>();

/**
 * Hook for resolving wallet addresses to World App usernames
 * Uses MiniKit.getUserByAddress() with caching and request deduplication
 *
 * @param walletAddress - Wallet address to resolve (undefined skips lookup)
 * @returns { profile, isLoading, error } - Profile data, loading state, and any error
 *
 * @example
 * const { profile, isLoading } = useUserProfile(sellerAddress);
 * // profile?.username available if user has registered username
 * // profile?.profilePictureUrl available if user has profile picture
 */
export function useUserProfile(walletAddress: string | undefined) {
  // Initialize from cache to avoid loading flicker
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (!walletAddress) return null;
    return profileCache.get(walletAddress) ?? null;
  });
  const [isLoading, setIsLoading] = useState(!profile && !!walletAddress);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // No address provided - reset state
    if (!walletAddress) {
      setProfile(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Check cache first
    const cached = profileCache.get(walletAddress);
    if (cached) {
      setProfile(cached);
      setIsLoading(false);
      return;
    }

    // Check if request already in flight (deduplication)
    let request = pendingRequests.get(walletAddress);

    if (!request) {
      // Start new request
      setIsLoading(true);
      request = MiniKit.getUserByAddress(walletAddress);
      pendingRequests.set(walletAddress, request);
    }

    request
      .then((result) => {
        // Map MiniKit result to our UserProfile type
        const userProfile: UserProfile = {
          walletAddress: result.walletAddress,
          username: result.username,
          profilePictureUrl: result.profilePictureUrl,
        };
        profileCache.set(walletAddress, userProfile);
        setProfile(userProfile);
        setError(null);
      })
      .catch((err) => {
        // Fallback: cache with just wallet address
        const fallback: UserProfile = { walletAddress };
        profileCache.set(walletAddress, fallback);
        setProfile(fallback);
        setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
      })
      .finally(() => {
        pendingRequests.delete(walletAddress);
        setIsLoading(false);
      });
  }, [walletAddress]);

  return { profile, isLoading, error };
}
