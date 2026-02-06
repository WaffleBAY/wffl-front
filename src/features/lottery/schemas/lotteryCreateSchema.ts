import { z } from 'zod';
import { MarketType } from '../types';

export const lotteryCreateSchema = z.object({
  marketType: z.nativeEnum(MarketType),
  title: z
    .string()
    .min(1, '상품명을 입력하세요')
    .max(50, '50자 이내로 입력하세요'),
  description: z
    .string()
    .min(10, '최소 10자 이상 입력하세요')
    .max(500, '500자 이내로 입력하세요'),
  imageFile: z
    .instanceof(File, { message: '이미지를 업로드하세요' })
    .refine((file) => file.size <= 5 * 1024 * 1024, '파일 크기는 5MB 이하여야 합니다')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'JPG, PNG, WebP 형식만 지원됩니다'
    ),
  entryPrice: z
    .number({ message: '응모 금액을 입력하세요' })
    .min(0, '0 이상이어야 합니다')
    .max(100, '최대 100 WLD'),
  targetAmount: z
    .number({ message: '목표 금액을 입력하세요' })
    .min(0, '0 이상이어야 합니다'),
  winnerCount: z
    .number({ message: '당첨 인원을 입력하세요' })
    .int('정수를 입력하세요')
    .min(1, '최소 1명')
    .max(100, '최대 100명'),
  expiresAt: z
    .date({ message: '만료 날짜를 선택하세요' })
    .refine((date) => date > new Date(), '미래 날짜를 선택하세요'),
  shippingRegions: z
    .array(z.string())
    .min(1, '최소 1개 지역을 선택하세요'),
});

export type LotteryCreateFormData = z.infer<typeof lotteryCreateSchema>;
