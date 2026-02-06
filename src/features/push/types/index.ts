/**
 * Push notification types for World App integration
 */

export type PushNotificationType = 'WIN' | 'SHIPPED' | 'DELIVERED' | 'DRAW_SOON' | 'REFUND_AVAILABLE' | 'SALE_COMPLETE';

export interface PushLocalisation {
  language: string; // 'en', 'ko', etc
  title: string; // Max 30 chars
  message: string; // Max 200 chars
}

export interface PushNotificationRequest {
  app_id: string;
  wallet_addresses: string[]; // Max 1,000 per request
  mini_app_path: string; // Deep link URL
  localisations: PushLocalisation[];
}

export interface PushNotificationResult {
  walletAddress: string;
  sent: boolean;
  reason?: string;
}

export interface PushNotificationResponse {
  result: PushNotificationResult[];
}
