import type { PushNotificationType, PushLocalisation } from '../types';

interface LocalizedMessage {
  ko: { title: string; message: string };
  en: { title: string; message: string };
}

/**
 * Localized push notification messages for each notification type.
 * Clean & informational tone, no emojis, no lottery name.
 */
export const PUSH_MESSAGES: Record<PushNotificationType, LocalizedMessage> = {
  WIN: {
    ko: {
      title: '당첨 알림',
      message: '복권에 당첨되었습니다. 배송 정보를 입력해주세요.',
    },
    en: {
      title: 'Winner Notification',
      message: 'You won the lottery. Please enter your shipping info.',
    },
  },
  SHIPPED: {
    ko: {
      title: '배송 시작',
      message: '경품 배송이 시작되었습니다.',
    },
    en: {
      title: 'Shipping Started',
      message: 'Your prize has been shipped.',
    },
  },
  DELIVERED: {
    ko: {
      title: '배송 완료',
      message: '경품이 도착했습니다. 수령을 확인해주세요.',
    },
    en: {
      title: 'Delivery Complete',
      message: 'Your prize has arrived. Please confirm receipt.',
    },
  },
  DRAW_SOON: {
    ko: {
      title: '추첨 예정',
      message: '참여한 복권의 추첨이 곧 진행됩니다.',
    },
    en: {
      title: 'Draw Coming Soon',
      message: 'The lottery you entered will be drawn soon.',
    },
  },
  REFUND_AVAILABLE: {
    ko: {
      title: '환불 안내',
      message: '마켓이 목표에 도달하지 못했습니다. 환불을 신청하세요.',
    },
    en: {
      title: 'Refund Available',
      message: 'Market did not reach its goal. You can claim a refund.',
    },
  },
  SALE_COMPLETE: {
    ko: {
      title: '판매 완료',
      message: '당첨자가 수령을 확인했습니다. 정산금이 전송되었습니다.',
    },
    en: {
      title: 'Sale Complete',
      message: 'Winner confirmed receipt. Settlement has been transferred.',
    },
  },
};

/**
 * Build localisations array for World App Push API
 * @param type - The push notification type
 * @returns Array of localisations with ko and en messages
 */
export function buildLocalisations(type: PushNotificationType): PushLocalisation[] {
  const messages = PUSH_MESSAGES[type];

  return [
    {
      language: 'ko',
      title: messages.ko.title,
      message: messages.ko.message,
    },
    {
      language: 'en',
      title: messages.en.title,
      message: messages.en.message,
    },
  ];
}
