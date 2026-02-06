/**
 * Deep link generator for World App push notifications
 * Uses world.org format per dec-10-02-01
 */

const WORLD_APP_BASE_URL = 'https://world.org/mini-app';
const APP_ID = process.env.NEXT_PUBLIC_WORLD_APP_ID || '';

/**
 * Generates a World App deep link URL for lottery detail pages
 * @param lotteryId - The lottery ID to link to
 * @returns Full deep link URL in world.org format
 */
export function generateLotteryDeepLink(lotteryId: string): string {
  const path = `/lottery/${lotteryId}`;
  const encodedPath = encodeURIComponent(path);
  return `${WORLD_APP_BASE_URL}?app_id=${APP_ID}&path=${encodedPath}`;
}
