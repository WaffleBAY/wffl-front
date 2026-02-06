import { COUNTRY_MAP } from '../constants/countries';

/**
 * Parse Accept-Language header to extract country code
 *
 * @param header - Accept-Language header value (e.g., "ko-KR,ko;q=0.9,en-US;q=0.8")
 * @returns ISO 3166-1 alpha-2 country code or null if not found/invalid
 *
 * @example
 * parseAcceptLanguage("ko-KR,ko;q=0.9,en-US;q=0.8") // "KR"
 * parseAcceptLanguage("en") // null (no region)
 * parseAcceptLanguage("xx-XX") // null (invalid country)
 * parseAcceptLanguage(null) // null
 */
export function parseAcceptLanguage(header: string | null): string | null {
  if (!header) {
    return null;
  }

  // Split by comma and process each locale in order of preference
  const locales = header.split(',').map((l) => l.trim());

  for (const locale of locales) {
    // Remove quality value (e.g., ";q=0.9")
    const localeWithoutQ = locale.split(';')[0].trim();

    // Split by hyphen to get language-region (e.g., "ko-KR" -> ["ko", "KR"])
    const parts = localeWithoutQ.split('-');

    if (parts.length >= 2) {
      // Country code is after the hyphen (e.g., "KR" from "ko-KR")
      const countryCode = parts[1].toUpperCase();

      // Validate against known countries
      if (COUNTRY_MAP.has(countryCode)) {
        return countryCode;
      }
    }
  }

  return null;
}
