'use client';

import { useRegionDetect } from '../hooks/useRegionDetect';

/**
 * Client component that initializes region detection on mount.
 * Renders nothing - just triggers the detection hook.
 * Use this in server components that need region filtering.
 */
export function RegionInitializer() {
  // This hook will detect and store user region on first visit
  useRegionDetect();

  // Render nothing - this component only triggers side effect
  return null;
}
