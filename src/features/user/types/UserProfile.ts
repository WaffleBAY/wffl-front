/**
 * User profile data structure returned from MiniKit.getUserByAddress()
 * Mirrors UserNameService from @worldcoin/minikit-js with domain-specific naming
 */
export interface UserProfile {
  /** Wallet address (always present) */
  walletAddress: string;
  /** World App username (optional - not all users have registered) */
  username?: string;
  /** Profile picture URL (optional) */
  profilePictureUrl?: string;
}
