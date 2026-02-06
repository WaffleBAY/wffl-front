/**
 * Abbreviates a wallet address for display
 * @param address - Full wallet address or null
 * @returns Abbreviated address (0x1234...abcd) or empty string
 * @example
 * abbreviateAddress('0x1234567890abcdef1234') // '0x1234...1234'
 * abbreviateAddress(null) // ''
 */
export function abbreviateAddress(address: string | null): string {
  if (!address) return '';
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
