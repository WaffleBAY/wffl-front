'use client';

import { useState, useEffect } from 'react';

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

/**
 * Calculate time remaining until a target timestamp
 * @param endTime - Unix timestamp in seconds
 */
function calculateTimeRemaining(endTime: number): TimeRemaining {
  const end = endTime * 1000; // Convert seconds to milliseconds
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    isExpired: false,
  };
}

/**
 * Hook to get countdown to a specific time
 * @param endTime - Unix timestamp in seconds
 */
export function useCountdown(endTime: number): TimeRemaining {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(endTime)
  );

  useEffect(() => {
    // Recalculate immediately when endTime changes
    setTimeRemaining(calculateTimeRemaining(endTime));

    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return timeRemaining;
}
