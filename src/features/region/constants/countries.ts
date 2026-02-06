import type { Country } from '../types';

/**
 * Worldwide special option for lotteries that ship to all countries
 */
export const WORLDWIDE: Country = {
  code: 'WORLDWIDE',
  name: 'Worldwide',
  nameKo: '전 세계',
};

/**
 * Supported countries list (sorted alphabetically by English name)
 * Includes World ID Credential countries + major markets
 */
export const COUNTRIES: Country[] = [
  { code: 'AR', name: 'Argentina', nameKo: '아르헨티나' },
  { code: 'AU', name: 'Australia', nameKo: '호주' },
  { code: 'BR', name: 'Brazil', nameKo: '브라질' },
  { code: 'CA', name: 'Canada', nameKo: '캐나다' },
  { code: 'CL', name: 'Chile', nameKo: '칠레' },
  { code: 'CN', name: 'China', nameKo: '중국' },
  { code: 'CO', name: 'Colombia', nameKo: '콜롬비아' },
  { code: 'CR', name: 'Costa Rica', nameKo: '코스타리카' },
  { code: 'FR', name: 'France', nameKo: '프랑스' },
  { code: 'DE', name: 'Germany', nameKo: '독일' },
  { code: 'HK', name: 'Hong Kong', nameKo: '홍콩' },
  { code: 'IN', name: 'India', nameKo: '인도' },
  { code: 'ID', name: 'Indonesia', nameKo: '인도네시아' },
  { code: 'IT', name: 'Italy', nameKo: '이탈리아' },
  { code: 'JP', name: 'Japan', nameKo: '일본' },
  { code: 'MY', name: 'Malaysia', nameKo: '말레이시아' },
  { code: 'MX', name: 'Mexico', nameKo: '멕시코' },
  { code: 'NL', name: 'Netherlands', nameKo: '네덜란드' },
  { code: 'NZ', name: 'New Zealand', nameKo: '뉴질랜드' },
  { code: 'PA', name: 'Panama', nameKo: '파나마' },
  { code: 'PH', name: 'Philippines', nameKo: '필리핀' },
  { code: 'SG', name: 'Singapore', nameKo: '싱가포르' },
  { code: 'KR', name: 'South Korea', nameKo: '대한민국' },
  { code: 'TW', name: 'Taiwan', nameKo: '대만' },
  { code: 'TH', name: 'Thailand', nameKo: '태국' },
  { code: 'GB', name: 'United Kingdom', nameKo: '영국' },
  { code: 'US', name: 'United States', nameKo: '미국' },
  { code: 'VN', name: 'Vietnam', nameKo: '베트남' },
].sort((a, b) => a.name.localeCompare(b.name));

/**
 * Map for O(1) country lookup by code
 */
export const COUNTRY_MAP = new Map<string, Country>(
  COUNTRIES.map((c) => [c.code, c])
);

/**
 * Get country by ISO 3166-1 alpha-2 code
 * @param code - Country code (e.g., 'KR', 'US')
 * @returns Country object or undefined if not found
 */
export function getCountryByCode(code: string): Country | undefined {
  if (code === 'WORLDWIDE') {
    return WORLDWIDE;
  }
  return COUNTRY_MAP.get(code.toUpperCase());
}
