'use client';

import { useEffect, useRef, useState } from 'react';
import { useRegionStore } from '../store/useRegionStore';

interface UseRegionDetectResult {
  userCountry: string | null;
  isLoading: boolean;
  isHydrated: boolean;
}

/**
 * Hook to detect and initialize user region
 *
 * - Waits for Zustand hydration before checking region
 * - Calls /api/region/detect to get country from Accept-Language if not set
 * - Prevents duplicate API calls with local ref
 *
 * @returns { userCountry, isLoading, isHydrated }
 */
export function useRegionDetect(): UseRegionDetectResult {
  const userCountry = useRegionStore((state) => state.userCountry);
  const setUserCountry = useRegionStore((state) => state.setUserCountry);
  const isHydrated = useRegionStore((state) => state._hasHydrated);

  const [isLoading, setIsLoading] = useState(false);
  const isInitializingRef = useRef(false);

  useEffect(() => {
    // Wait for hydration before checking region
    if (!isHydrated) {
      return;
    }

    // Skip if region is already set
    if (userCountry !== null) {
      return;
    }

    // Prevent duplicate API calls
    if (isInitializingRef.current) {
      return;
    }

    const detectRegion = async () => {
      isInitializingRef.current = true;
      setIsLoading(true);

      try {
        const response = await fetch('/api/region/detect');
        const data = await response.json();

        if (data.country) {
          setUserCountry(data.country);
        }
      } catch (error) {
        // Silently fail - user can still use the app without region filter
        console.error('Failed to detect region:', error);
      } finally {
        setIsLoading(false);
        isInitializingRef.current = false;
      }
    };

    detectRegion();
  }, [isHydrated, userCountry, setUserCountry]);

  return {
    userCountry,
    isLoading,
    isHydrated,
  };
}
