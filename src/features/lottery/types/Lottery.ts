import { LotteryStatus, MarketType } from './LotteryStatus';

/**
 * Lottery/Raffle market data - aligned with WaffleMarket contract
 * @see wffl-contract/src/WaffleMarket.sol
 */
export interface Lottery {
  // Identifiers
  id: string;                        // Internal DB ID or market index
  contractAddress: string;           // Deployed WaffleMarket contract address

  // Display info
  title: string;
  description: string;
  imageUrl: string;
  prizeDescription: string;

  // Market type
  marketType: MarketType;            // LOTTERY or RAFFLE

  // Economic model (all in ETH/WLD)
  ticketPrice: string;               // Entry price per ticket (bigint as string)
  participantDeposit: string;        // Fixed 0.005 ETH per participant
  sellerDeposit: string;             // RAFFLE: 15% of goalAmount, LOTTERY: 0
  prizePool: string;                 // 95% of ticket sales accumulated

  // Conditions
  goalAmount: string;                // LOTTERY: target prize pool
  preparedQuantity: number;          // RAFFLE: number of prizes to give out
  endTime: number;                   // Unix timestamp when entries close

  // Current state
  status: LotteryStatus;
  participantCount: number;          // participants.length from contract

  // Seller info
  seller: string;                    // Seller wallet address

  // Winners (after REVEALED)
  winners: string[];                 // Winner wallet addresses

  // Randomness (for verification)
  snapshotBlock?: number;            // Block number for randomness
  commitment?: string;               // hash(secret + nonce)
  nonce?: number;                    // Additional entropy

  // Shipping regions (off-chain metadata)
  shippingRegions: string[];         // ISO 3166-1 alpha-2 or 'WORLDWIDE'

  // Timestamps
  createdAt: string;                 // ISO 8601
  openedAt?: string;                 // When seller called openMarket
  closedAt?: string;                 // When entries closed
  revealedAt?: string;               // When winner was selected
  completedAt?: string;              // When winner confirmed receipt
}

/**
 * Participant info from contract
 */
export interface ParticipantInfo {
  address: string;
  hasEntered: boolean;
  isWinner: boolean;
  paidAmount: string;                // ticketPrice + participantDeposit
  depositRefunded: boolean;
}

/**
 * Create market params - matches WaffleFactory.createMarket
 */
export interface CreateMarketParams {
  marketType: MarketType;
  ticketPrice: string;               // In wei
  goalAmount: string;                // In wei (for LOTTERY)
  preparedQuantity: number;          // Number of prizes (for RAFFLE)
  duration: number;                  // In seconds

  // Off-chain metadata (stored in backend)
  title: string;
  description: string;
  imageUrl: string;
  prizeDescription: string;
  shippingRegions: string[];
}

/**
 * Entry params - matches WaffleMarket.enter
 */
export interface EnterMarketParams {
  marketAddress: string;
  root: string;                      // WorldID merkle root
  nullifierHash: string;             // WorldID nullifier hash
  proof: string[];                   // WorldID proof (8 elements)
  value: string;                     // ticketPrice + participantDeposit in wei
}

/**
 * Helper to calculate required entry value
 */
export function calculateEntryValue(ticketPrice: string, participantDeposit: string): bigint {
  return BigInt(ticketPrice) + BigInt(participantDeposit);
}

/**
 * Helper to check if user is a winner
 */
export function isUserWinner(lottery: Lottery, userAddress: string): boolean {
  return lottery.winners.some(
    (winner) => winner.toLowerCase() === userAddress.toLowerCase()
  );
}

/**
 * Helper to get winner count based on market type
 */
export function getWinnerCount(lottery: Lottery): number {
  if (lottery.marketType === MarketType.LOTTERY) {
    return 1;
  }
  return Math.min(lottery.preparedQuantity, lottery.participantCount);
}
