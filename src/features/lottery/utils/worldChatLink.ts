/**
 * World Chat deep link generator
 * Creates links to initiate chat with a user in the World App
 */

const WORLD_CHAT_APP_ID = 'app_e293fcd0565f45ca296aa317212d8741';
const WORLD_APP_BASE_URL = 'https://worldcoin.org/mini-app';

/**
 * Generates a World Chat deep link URL
 * @param username - The World App username of the recipient (resolve via useUserProfile first)
 * @param message - Optional pre-filled message
 * @returns Full deep link URL to World Chat
 */
export function generateWorldChatLink(
  username: string,
  message?: string
): string {
  // Construct the path
  let path = `/${username}/draft`;
  if (message) {
    path += `?message=${encodeURIComponent(message)}`;
  }

  // Build the full URL with encoded path
  const encodedPath = encodeURIComponent(path);
  return `${WORLD_APP_BASE_URL}?app_id=${WORLD_CHAT_APP_ID}&path=${encodedPath}`;
}
