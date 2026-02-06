import { LotteryStatus, MarketType } from '@/features/lottery/types'
import type { Lottery, CreateMarketParams } from '@/features/lottery/types'

/**
 * Factory for creating test lottery objects
 */
export function createMockLottery(overrides: Partial<Lottery> = {}): Lottery {
  return {
    id: 'test-lottery-1',
    contractAddress: '0x1234567890123456789012345678901234567890',
    title: 'Test Lottery',
    description: 'This is a test lottery for E2E testing',
    imageUrl: 'https://example.com/image.jpg',
    prizeDescription: 'A wonderful prize',
    marketType: MarketType.LOTTERY,
    ticketPrice: '1000000000000000', // 0.001 ETH
    participantDeposit: '5000000000000000', // 0.005 ETH
    sellerDeposit: '0',
    prizePool: '0',
    goalAmount: '10000000000000000', // 0.01 ETH
    preparedQuantity: 1,
    endTime: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
    status: LotteryStatus.OPEN,
    participantCount: 0,
    seller: '0xSellerAddress1234567890123456789012345678',
    winners: [],
    shippingRegions: ['KR', 'US'],
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Create mock lottery with specific status
 */
export function createMockLotteryWithStatus(status: LotteryStatus): Lottery {
  const base = createMockLottery({ status })

  switch (status) {
    case LotteryStatus.CREATED:
      return { ...base, participantCount: 0 }
    case LotteryStatus.OPEN:
      return { ...base, openedAt: new Date().toISOString() }
    case LotteryStatus.CLOSED:
      return {
        ...base,
        participantCount: 5,
        closedAt: new Date().toISOString(),
      }
    case LotteryStatus.REVEALED:
      return {
        ...base,
        participantCount: 5,
        winners: ['0xWinnerAddress1234567890123456789012345678'],
        revealedAt: new Date().toISOString(),
      }
    case LotteryStatus.COMPLETED:
      return {
        ...base,
        participantCount: 5,
        winners: ['0xWinnerAddress1234567890123456789012345678'],
        completedAt: new Date().toISOString(),
      }
    case LotteryStatus.FAILED:
      return {
        ...base,
        participantCount: 0,
      }
    default:
      return base
  }
}

/**
 * Create mock raffle
 */
export function createMockRaffle(overrides: Partial<Lottery> = {}): Lottery {
  const goalAmount = '100000000000000000' // 0.1 ETH
  const sellerDeposit = (BigInt(goalAmount) * BigInt(15) / BigInt(100)).toString()

  return {
    ...createMockLottery(),
    marketType: MarketType.RAFFLE,
    preparedQuantity: 5, // 5 winners
    goalAmount,
    sellerDeposit,
    ...overrides,
  }
}

/**
 * Create mock create params
 */
export function createMockCreateParams(overrides: Partial<CreateMarketParams> = {}): CreateMarketParams {
  return {
    marketType: MarketType.LOTTERY,
    ticketPrice: '1000000000000000', // 0.001 ETH in wei
    goalAmount: '10000000000000000', // 0.01 ETH in wei
    preparedQuantity: 1,
    duration: 86400, // 24 hours
    title: 'Test Lottery',
    description: 'A test lottery description',
    imageUrl: 'https://example.com/image.jpg',
    prizeDescription: 'A wonderful prize',
    shippingRegions: ['KR'],
    ...overrides,
  }
}

/**
 * Test scenarios for edge cases
 */
export const testScenarios = {
  // Zero amounts scenario
  freeLottery: createMockLottery({
    ticketPrice: '0',
    goalAmount: '0',
    marketType: MarketType.LOTTERY,
  }),

  // High value lottery
  highValueLottery: createMockLottery({
    ticketPrice: '1000000000000000000', // 1 ETH
    goalAmount: '100000000000000000000', // 100 ETH
  }),

  // Raffle with multiple winners
  multiWinnerRaffle: createMockRaffle({
    preparedQuantity: 10,
    participantCount: 50,
    winners: Array.from({ length: 10 }, (_, i) =>
      `0xWinner${i.toString().padStart(38, '0')}`
    ),
    status: LotteryStatus.REVEALED,
  }),

  // Expired lottery
  expiredLottery: createMockLottery({
    endTime: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    status: LotteryStatus.CLOSED,
  }),

  // Lottery at goal
  atGoalLottery: createMockLottery({
    ticketPrice: '1000000000000000', // 0.001 ETH
    goalAmount: '10000000000000000', // 0.01 ETH
    participantCount: 10,
    prizePool: '9500000000000000', // 95% of 10 tickets
  }),
}
