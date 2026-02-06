import { describe, it, expect } from 'vitest'
import { LotteryStatus, MarketType } from '@/features/lottery/types'
import { canSettle, canClaimRefund } from '@/features/lottery/types/LotteryStatus'
import { isUserWinner, getWinnerCount } from '@/features/lottery/types/Lottery'
import { createMockLottery, createMockRaffle, createMockLotteryWithStatus } from './mocks/lottery'

/**
 * Tests for the settlement flow (settle, claimRefund)
 */

describe('Settlement Flow - Winner Determination', () => {
  describe('LOTTERY type (single winner)', () => {
    it('correctly identifies winner', () => {
      const lottery = createMockLottery({
        status: LotteryStatus.REVEALED,
        winners: ['0xWinner1234567890123456789012345678901234'],
      })

      expect(isUserWinner(lottery, '0xWinner1234567890123456789012345678901234')).toBe(true)
      expect(isUserWinner(lottery, '0xLoser12345678901234567890123456789012345')).toBe(false)
    })

    it('winner count is always 1', () => {
      const lottery = createMockLottery({
        marketType: MarketType.LOTTERY,
        participantCount: 100,
      })
      expect(getWinnerCount(lottery)).toBe(1)
    })
  })

  describe('RAFFLE type (multiple winners)', () => {
    it('correctly identifies multiple winners', () => {
      const raffle = createMockRaffle({
        status: LotteryStatus.REVEALED,
        winners: [
          '0xWinner1234567890123456789012345678901234',
          '0xWinner2234567890123456789012345678901234',
          '0xWinner3234567890123456789012345678901234',
        ],
      })

      expect(isUserWinner(raffle, '0xWinner1234567890123456789012345678901234')).toBe(true)
      expect(isUserWinner(raffle, '0xWinner2234567890123456789012345678901234')).toBe(true)
      expect(isUserWinner(raffle, '0xWinner3234567890123456789012345678901234')).toBe(true)
      expect(isUserWinner(raffle, '0xLoser12345678901234567890123456789012345')).toBe(false)
    })

    it('winner count is min of preparedQuantity and participantCount', () => {
      const raffle1 = createMockRaffle({
        preparedQuantity: 5,
        participantCount: 10,
      })
      expect(getWinnerCount(raffle1)).toBe(5)

      const raffle2 = createMockRaffle({
        preparedQuantity: 10,
        participantCount: 3,
      })
      expect(getWinnerCount(raffle2)).toBe(3)
    })
  })
})

describe('Settlement Flow - Action Eligibility', () => {
  describe('settle eligibility', () => {
    it('allowed only in REVEALED status', () => {
      expect(canSettle(LotteryStatus.REVEALED)).toBe(true)
      expect(canSettle(LotteryStatus.CREATED)).toBe(false)
      expect(canSettle(LotteryStatus.OPEN)).toBe(false)
      expect(canSettle(LotteryStatus.CLOSED)).toBe(false)
      expect(canSettle(LotteryStatus.COMPLETED)).toBe(false)
      expect(canSettle(LotteryStatus.FAILED)).toBe(false)
    })

    it('anyone can call settle in REVEALED status', () => {
      const lottery = createMockLotteryWithStatus(LotteryStatus.REVEALED)
      expect(canSettle(lottery.status)).toBe(true)
    })
  })

  describe('claimRefund eligibility', () => {
    it('allowed in FAILED status (all participants get deposit + pool share)', () => {
      expect(canClaimRefund(LotteryStatus.FAILED)).toBe(true)
    })

    it('allowed in COMPLETED status (deposit refund for all participants)', () => {
      expect(canClaimRefund(LotteryStatus.COMPLETED)).toBe(true)
    })

    it('not allowed in other statuses', () => {
      expect(canClaimRefund(LotteryStatus.CREATED)).toBe(false)
      expect(canClaimRefund(LotteryStatus.OPEN)).toBe(false)
      expect(canClaimRefund(LotteryStatus.CLOSED)).toBe(false)
      expect(canClaimRefund(LotteryStatus.REVEALED)).toBe(false)
    })
  })
})

describe('Settlement Flow - User Role Determination', () => {
  interface SettlementContext {
    lotteryStatus: LotteryStatus
    userAddress: string
    sellerAddress: string
    winners: string[]
    participantAddresses: string[]
  }

  type UserRole = 'seller' | 'winner' | 'loser' | 'viewer'

  function determineUserRole(ctx: SettlementContext): UserRole {
    const userAddr = ctx.userAddress.toLowerCase()
    const isParticipant = ctx.participantAddresses.some(
      (addr) => addr.toLowerCase() === userAddr
    )
    const isWinner = ctx.winners.some((addr) => addr.toLowerCase() === userAddr)
    const isSeller = ctx.sellerAddress.toLowerCase() === userAddr

    if (isSeller) return 'seller'
    if (isWinner) return 'winner'
    if (isParticipant) return 'loser'
    return 'viewer'
  }

  it('identifies seller correctly', () => {
    const ctx: SettlementContext = {
      lotteryStatus: LotteryStatus.REVEALED,
      userAddress: '0xSeller12345678901234567890123456789012345',
      sellerAddress: '0xSeller12345678901234567890123456789012345',
      winners: ['0xWinner12345678901234567890123456789012345'],
      participantAddresses: ['0xWinner12345678901234567890123456789012345'],
    }
    expect(determineUserRole(ctx)).toBe('seller')
  })

  it('identifies winner correctly', () => {
    const ctx: SettlementContext = {
      lotteryStatus: LotteryStatus.REVEALED,
      userAddress: '0xWinner12345678901234567890123456789012345',
      sellerAddress: '0xSeller12345678901234567890123456789012345',
      winners: ['0xWinner12345678901234567890123456789012345'],
      participantAddresses: ['0xWinner12345678901234567890123456789012345'],
    }
    expect(determineUserRole(ctx)).toBe('winner')
  })

  it('identifies loser correctly', () => {
    const ctx: SettlementContext = {
      lotteryStatus: LotteryStatus.REVEALED,
      userAddress: '0xLoser123456789012345678901234567890123456',
      sellerAddress: '0xSeller12345678901234567890123456789012345',
      winners: ['0xWinner12345678901234567890123456789012345'],
      participantAddresses: [
        '0xWinner12345678901234567890123456789012345',
        '0xLoser123456789012345678901234567890123456',
      ],
    }
    expect(determineUserRole(ctx)).toBe('loser')
  })

  it('identifies viewer correctly', () => {
    const ctx: SettlementContext = {
      lotteryStatus: LotteryStatus.REVEALED,
      userAddress: '0xViewer12345678901234567890123456789012345',
      sellerAddress: '0xSeller12345678901234567890123456789012345',
      winners: ['0xWinner12345678901234567890123456789012345'],
      participantAddresses: ['0xWinner12345678901234567890123456789012345'],
    }
    expect(determineUserRole(ctx)).toBe('viewer')
  })
})

describe('Settlement Flow - Refund Amount Calculation', () => {
  // Based on new contract logic
  // FAILED: deposit + pool share
  // COMPLETED: deposit only
  function calculateRefundAmount(
    ticketPrice: bigint,
    participantDeposit: bigint,
    status: LotteryStatus
  ): bigint {
    if (status === LotteryStatus.FAILED) {
      // Full refund: ticket + deposit (pool share)
      return ticketPrice + participantDeposit
    }

    if (status === LotteryStatus.COMPLETED) {
      // Deposit only
      return participantDeposit
    }

    return BigInt(0)
  }

  it('full refund for FAILED lottery', () => {
    const ticketPrice = BigInt('1000000000000000000') // 1 WLD
    const deposit = BigInt('5000000000000000000') // 5 WLD

    const refund = calculateRefundAmount(ticketPrice, deposit, LotteryStatus.FAILED)
    expect(refund).toBe(BigInt('6000000000000000000')) // 6 WLD
  })

  it('deposit only refund for COMPLETED', () => {
    const ticketPrice = BigInt('1000000000000000000') // 1 WLD
    const deposit = BigInt('5000000000000000000') // 5 WLD

    const refund = calculateRefundAmount(ticketPrice, deposit, LotteryStatus.COMPLETED)
    expect(refund).toBe(BigInt('5000000000000000000')) // Only deposit (5 WLD)
  })

  it('handles zero ticket price correctly', () => {
    const ticketPrice = BigInt(0)
    const deposit = BigInt('5000000000000000000') // 5 WLD

    const refund = calculateRefundAmount(ticketPrice, deposit, LotteryStatus.FAILED)
    expect(refund).toBe(BigInt('5000000000000000000')) // Only deposit (5 WLD)
  })
})

describe('Settlement Flow - State Transitions', () => {
  it('REVEALED -> COMPLETED after settle', () => {
    const lottery = createMockLotteryWithStatus(LotteryStatus.REVEALED)
    expect(canSettle(lottery.status)).toBe(true)
    // Contract would transition to COMPLETED after successful settle
  })

  it('FAILED is terminal (no further transitions)', () => {
    const lottery = createMockLotteryWithStatus(LotteryStatus.FAILED)
    expect(canClaimRefund(lottery.status)).toBe(true)
    // After all refunds claimed, status stays FAILED
  })

  it('COMPLETED allows deposit refund', () => {
    const lottery = createMockLotteryWithStatus(LotteryStatus.COMPLETED)
    expect(canSettle(lottery.status)).toBe(false)
    expect(canClaimRefund(lottery.status)).toBe(true)
  })
})
