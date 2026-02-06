import { describe, it, expect } from 'vitest'
import {
  calculateEntryValue,
  isUserWinner,
  getWinnerCount,
} from '@/features/lottery/types/Lottery'
import { LotteryStatus, MarketType } from '@/features/lottery/types/LotteryStatus'
import { createMockLottery, createMockRaffle } from './mocks/lottery'

describe('calculateEntryValue', () => {
  it('calculates entry value correctly', () => {
    const ticketPrice = '1000000000000000000' // 1 WLD
    const participantDeposit = '5000000000000000000' // 5 WLD
    const result = calculateEntryValue(ticketPrice, participantDeposit)
    expect(result).toBe(BigInt('6000000000000000000')) // 6 WLD
  })

  it('handles zero ticket price (free lottery)', () => {
    const ticketPrice = '0'
    const participantDeposit = '5000000000000000000'
    const result = calculateEntryValue(ticketPrice, participantDeposit)
    expect(result).toBe(BigInt('5000000000000000000')) // Only deposit
  })

  it('handles zero deposit', () => {
    const ticketPrice = '1000000000000000000'
    const participantDeposit = '0'
    const result = calculateEntryValue(ticketPrice, participantDeposit)
    expect(result).toBe(BigInt('1000000000000000000')) // Only ticket
  })

  it('handles both zero (completely free)', () => {
    const ticketPrice = '0'
    const participantDeposit = '0'
    const result = calculateEntryValue(ticketPrice, participantDeposit)
    expect(result).toBe(BigInt(0))
  })

  it('handles large values', () => {
    const ticketPrice = '10000000000000000000' // 10 WLD
    const participantDeposit = '5000000000000000000' // 5 WLD
    const result = calculateEntryValue(ticketPrice, participantDeposit)
    expect(result).toBe(BigInt('15000000000000000000'))
  })
})

describe('isUserWinner', () => {
  it('returns true when user address is in winners', () => {
    const lottery = createMockLottery({
      winners: ['0x1234567890123456789012345678901234567890'],
    })
    expect(isUserWinner(lottery, '0x1234567890123456789012345678901234567890')).toBe(true)
  })

  it('handles case-insensitive comparison', () => {
    const lottery = createMockLottery({
      winners: ['0x1234567890123456789012345678901234567890'],
    })
    expect(isUserWinner(lottery, '0x1234567890123456789012345678901234567890'.toUpperCase())).toBe(true)
  })

  it('returns false when user is not in winners', () => {
    const lottery = createMockLottery({
      winners: ['0x1234567890123456789012345678901234567890'],
    })
    expect(isUserWinner(lottery, '0xABCDef1234567890123456789012345678901234')).toBe(false)
  })

  it('returns false when winners array is empty', () => {
    const lottery = createMockLottery({
      winners: [],
    })
    expect(isUserWinner(lottery, '0x1234567890123456789012345678901234567890')).toBe(false)
  })

  it('handles multiple winners (raffle)', () => {
    const lottery = createMockRaffle({
      winners: [
        '0x1111111111111111111111111111111111111111',
        '0x2222222222222222222222222222222222222222',
        '0x3333333333333333333333333333333333333333',
      ],
    })
    expect(isUserWinner(lottery, '0x2222222222222222222222222222222222222222')).toBe(true)
  })
})

describe('getWinnerCount', () => {
  describe('LOTTERY type', () => {
    it('always returns 1 for lottery', () => {
      const lottery = createMockLottery({
        marketType: MarketType.LOTTERY,
        preparedQuantity: 5, // Should be ignored
        participantCount: 10,
      })
      expect(getWinnerCount(lottery)).toBe(1)
    })
  })

  describe('RAFFLE type', () => {
    it('returns preparedQuantity when enough participants', () => {
      const raffle = createMockRaffle({
        preparedQuantity: 5,
        participantCount: 10,
      })
      expect(getWinnerCount(raffle)).toBe(5)
    })

    it('returns participantCount when fewer than preparedQuantity', () => {
      const raffle = createMockRaffle({
        preparedQuantity: 10,
        participantCount: 3,
      })
      expect(getWinnerCount(raffle)).toBe(3)
    })

    it('returns 0 when no participants', () => {
      const raffle = createMockRaffle({
        preparedQuantity: 5,
        participantCount: 0,
      })
      expect(getWinnerCount(raffle)).toBe(0)
    })

    it('returns exact count when equal', () => {
      const raffle = createMockRaffle({
        preparedQuantity: 5,
        participantCount: 5,
      })
      expect(getWinnerCount(raffle)).toBe(5)
    })
  })
})
