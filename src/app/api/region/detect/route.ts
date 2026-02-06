import { headers } from 'next/headers';
import { parseAcceptLanguage } from '@/features/region/utils/parseAcceptLanguage';

/**
 * GET /api/region/detect
 *
 * Detects user's country from Accept-Language header
 *
 * @returns JSON { country: string | null, locale: string, raw: string }
 */
export async function GET() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';

  // Extract primary locale (first entry)
  const primaryLocale = acceptLanguage.split(',')[0]?.trim() || 'en';

  // Parse country code from Accept-Language
  const country = parseAcceptLanguage(acceptLanguage);

  return Response.json({
    country,
    locale: primaryLocale,
    raw: acceptLanguage,
  });
}
