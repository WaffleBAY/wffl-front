/**
 * Region types for geographic filtering
 */

/**
 * Country interface with ISO 3166-1 alpha-2 code and localized names
 */
export interface Country {
  code: string;       // ISO 3166-1 alpha-2 (e.g., 'KR', 'US') or 'WORLDWIDE'
  name: string;       // English name
  nameKo: string;     // Korean name
}

/**
 * Country code type - ISO 3166-1 alpha-2 codes supported by the platform
 * or 'WORLDWIDE' for global lotteries
 */
export type CountryCode =
  | 'WORLDWIDE'
  // World ID Credential countries
  | 'AR' // Argentina
  | 'CL' // Chile
  | 'CO' // Colombia
  | 'CR' // Costa Rica
  | 'JP' // Japan
  | 'MY' // Malaysia
  | 'MX' // Mexico
  | 'PA' // Panama
  | 'SG' // Singapore
  | 'KR' // South Korea
  | 'TW' // Taiwan
  | 'GB' // United Kingdom
  | 'US' // United States
  // Major markets
  | 'AU' // Australia
  | 'BR' // Brazil
  | 'CA' // Canada
  | 'CN' // China
  | 'DE' // Germany
  | 'FR' // France
  | 'HK' // Hong Kong
  | 'ID' // Indonesia
  | 'IN' // India
  | 'IT' // Italy
  | 'NL' // Netherlands
  | 'NZ' // New Zealand
  | 'PH' // Philippines
  | 'TH' // Thailand
  | 'VN'; // Vietnam
