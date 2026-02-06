import type {
  PushNotificationType,
  PushNotificationRequest,
  PushNotificationResponse,
} from '../types';
import { buildLocalisations } from '../constants/messages';
import { generateLotteryDeepLink } from '../utils/deepLink';

const PUSH_API_URL = 'https://developer.worldcoin.org/api/v2/minikit/send-notification';
const MAX_ADDRESSES_PER_REQUEST = 1000;

interface SendPushOptions {
  walletAddresses: string[];
  notificationType: PushNotificationType;
  lotteryId: string;
}

/**
 * Send push notification to World App users
 * Handles silent failure - errors are logged but not thrown
 * @param options - Push notification options
 */
export async function sendPush(options: SendPushOptions): Promise<void> {
  const { walletAddresses, notificationType, lotteryId } = options;

  // Early return if no addresses
  if (!walletAddresses || walletAddresses.length === 0) {
    return;
  }

  // Slice to max addresses per API limit
  const addresses = walletAddresses.slice(0, MAX_ADDRESSES_PER_REQUEST);

  const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID;
  const apiKey = process.env.WORLD_APP_API_KEY;

  if (!appId || !apiKey) {
    console.error('[Push] Missing WORLD_APP_ID or WORLD_APP_API_KEY');
    return;
  }

  const request: PushNotificationRequest = {
    app_id: appId,
    wallet_addresses: addresses,
    mini_app_path: generateLotteryDeepLink(lotteryId),
    localisations: buildLocalisations(notificationType),
  };

  try {
    const response = await fetch(PUSH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Push] API error ${response.status}: ${errorText}`);
      return;
    }

    const data: PushNotificationResponse = await response.json();

    // Log failures only
    const failures = data.result.filter((r) => !r.sent);
    if (failures.length > 0) {
      console.error(
        `[Push] ${failures.length}/${addresses.length} notifications failed:`,
        failures.map((f) => ({ address: f.walletAddress.slice(0, 10), reason: f.reason }))
      );
    }
  } catch (error) {
    // Silent failure - log and return
    console.error('[Push] Failed to send notification:', error);
  }
}

/**
 * Send win notification to a lottery winner
 * @param winnerAddress - Winner's wallet address
 * @param lotteryId - The lottery ID
 */
export async function sendWinNotification(
  winnerAddress: string,
  lotteryId: string
): Promise<void> {
  await sendPush({
    walletAddresses: [winnerAddress],
    notificationType: 'WIN',
    lotteryId,
  });
}

/**
 * Send shipping status notification
 * @param addresses - Wallet addresses to notify
 * @param lotteryId - The lottery ID
 * @param status - Shipping status: SHIPPED or DELIVERED
 */
export async function sendShippingNotification(
  addresses: string[],
  lotteryId: string,
  status: 'SHIPPED' | 'DELIVERED'
): Promise<void> {
  await sendPush({
    walletAddresses: addresses,
    notificationType: status,
    lotteryId,
  });
}

/**
 * Send draw soon notification to participants
 * @param addresses - Wallet addresses of participants
 * @param lotteryId - The lottery ID
 */
export async function sendDrawSoonNotification(
  addresses: string[],
  lotteryId: string
): Promise<void> {
  await sendPush({
    walletAddresses: addresses,
    notificationType: 'DRAW_SOON',
    lotteryId,
  });
}
