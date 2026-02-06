import { describe, it, expect } from 'vitest'
import {
  LotteryStatus,
  MarketType,
  VALID_TRANSITIONS,
  isTerminalStatus,
  isEntryOpen,
  canSettle,
  canClaimRefund,
} from '@/features/lottery/types/LotteryStatus'

describe('LotteryStatus Enum', () => {
  it('should have all 6 status values', () => {
    expect(Object.keys(LotteryStatus)).toHaveLength(6)
    expect(LotteryStatus.CREATED).toBe('CREATED')
    expect(LotteryStatus.OPEN).toBe('OPEN')
    expect(LotteryStatus.CLOSED).toBe('CLOSED')
    expect(LotteryStatus.REVEALED).toBe('REVEALED')
    expect(LotteryStatus.COMPLETED).toBe('COMPLETED')
    expect(LotteryStatus.FAILED).toBe('FAILED')
  })
})

describe('MarketType Enum', () => {
  it('should have LOTTERY and RAFFLE types', () => {
    expect(MarketType.LOTTERY).toBe('LOTTERY')
    expect(MarketType.RAFFLE).toBe('RAFFLE')
  })
})

describe('VALID_TRANSITIONS', () => {
  it('CREATED can transition to OPEN', () => {
    expect(VALID_TRANSITIONS[LotteryStatus.CREATED]).toContain(LotteryStatus.OPEN)
  })

  it('OPEN can transition to CLOSED or FAILED', () => {
    expect(VALID_TRANSITIONS[LotteryStatus.OPEN]).toContain(LotteryStatus.CLOSED)
    expect(VALID_TRANSITIONS[LotteryStatus.OPEN]).toContain(LotteryStatus.FAILED)
  })

  it('CLOSED can transition to REVEALED or FAILED', () => {
    expect(VALID_TRANSITIONS[LotteryStatus.CLOSED]).toContain(LotteryStatus.REVEALED)
    expect(VALID_TRANSITIONS[LotteryStatus.CLOSED]).toContain(LotteryStatus.FAILED)
  })

  it('REVEALED can only transition to COMPLETED', () => {
    expect(VALID_TRANSITIONS[LotteryStatus.REVEALED]).toEqual([LotteryStatus.COMPLETED])
  })

  it('COMPLETED is terminal (no transitions)', () => {
    expect(VALID_TRANSITIONS[LotteryStatus.COMPLETED]).toEqual([])
  })

  it('FAILED is terminal (no transitions)', () => {
    expect(VALID_TRANSITIONS[LotteryStatus.FAILED]).toEqual([])
  })
})

describe('isTerminalStatus', () => {
  it('returns true for COMPLETED', () => {
    expect(isTerminalStatus(LotteryStatus.COMPLETED)).toBe(true)
  })

  it('returns true for FAILED', () => {
    expect(isTerminalStatus(LotteryStatus.FAILED)).toBe(true)
  })

  it('returns false for non-terminal statuses', () => {
    expect(isTerminalStatus(LotteryStatus.CREATED)).toBe(false)
    expect(isTerminalStatus(LotteryStatus.OPEN)).toBe(false)
    expect(isTerminalStatus(LotteryStatus.CLOSED)).toBe(false)
    expect(isTerminalStatus(LotteryStatus.REVEALED)).toBe(false)
  })
})

describe('isEntryOpen', () => {
  it('returns true only for OPEN status', () => {
    expect(isEntryOpen(LotteryStatus.OPEN)).toBe(true)
  })

  it('returns false for all other statuses', () => {
    expect(isEntryOpen(LotteryStatus.CREATED)).toBe(false)
    expect(isEntryOpen(LotteryStatus.CLOSED)).toBe(false)
    expect(isEntryOpen(LotteryStatus.REVEALED)).toBe(false)
    expect(isEntryOpen(LotteryStatus.COMPLETED)).toBe(false)
    expect(isEntryOpen(LotteryStatus.FAILED)).toBe(false)
  })
})

describe('canSettle', () => {
  it('returns true only for REVEALED status', () => {
    expect(canSettle(LotteryStatus.REVEALED)).toBe(true)
  })

  it('returns false for all other statuses', () => {
    expect(canSettle(LotteryStatus.CREATED)).toBe(false)
    expect(canSettle(LotteryStatus.OPEN)).toBe(false)
    expect(canSettle(LotteryStatus.CLOSED)).toBe(false)
    expect(canSettle(LotteryStatus.COMPLETED)).toBe(false)
    expect(canSettle(LotteryStatus.FAILED)).toBe(false)
  })
})

describe('canClaimRefund', () => {
  it('returns true for FAILED status', () => {
    expect(canClaimRefund(LotteryStatus.FAILED)).toBe(true)
  })

  it('returns true for COMPLETED status (deposit refund)', () => {
    expect(canClaimRefund(LotteryStatus.COMPLETED)).toBe(true)
  })

  it('returns false for other statuses', () => {
    expect(canClaimRefund(LotteryStatus.CREATED)).toBe(false)
    expect(canClaimRefund(LotteryStatus.OPEN)).toBe(false)
    expect(canClaimRefund(LotteryStatus.CLOSED)).toBe(false)
    expect(canClaimRefund(LotteryStatus.REVEALED)).toBe(false)
  })
})
