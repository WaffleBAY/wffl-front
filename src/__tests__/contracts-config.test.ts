import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CHAIN_ID, PARTICIPANT_DEPOSIT, WORLD_FOUNDATION_FEE_BPS, OPS_WALLET_FEE_BPS } from '@/config/contracts'

/**
 * Tests for contract configuration constants
 */

describe('Contract Configuration', () => {
  describe('Chain ID', () => {
    it('is World Chain Sepolia (4801)', () => {
      expect(CHAIN_ID).toBe(4801)
    })
  })

  describe('Constants', () => {
    it('PARTICIPANT_DEPOSIT is 0.005 ETH', () => {
      expect(PARTICIPANT_DEPOSIT).toBe(BigInt('5000000000000000'))
      // Verify it equals 0.005 ETH
      expect(PARTICIPANT_DEPOSIT / BigInt(1e15)).toBe(BigInt(5)) // 5 * 10^15 = 0.005 * 10^18
    })

    it('WORLD_FOUNDATION_FEE_BPS is 3%', () => {
      expect(WORLD_FOUNDATION_FEE_BPS).toBe(300)
      // 300 basis points = 3%
      expect(WORLD_FOUNDATION_FEE_BPS / 100).toBe(3)
    })

    it('OPS_WALLET_FEE_BPS is 2%', () => {
      expect(OPS_WALLET_FEE_BPS).toBe(200)
      // 200 basis points = 2%
      expect(OPS_WALLET_FEE_BPS / 100).toBe(2)
    })

    it('total fee is 5%', () => {
      const totalFeeBps = WORLD_FOUNDATION_FEE_BPS + OPS_WALLET_FEE_BPS
      expect(totalFeeBps).toBe(500) // 5%
    })
  })

  describe('Fee Calculations', () => {
    function calculatePrizePool(totalTicketSales: bigint): bigint {
      const totalFeeBps = BigInt(WORLD_FOUNDATION_FEE_BPS + OPS_WALLET_FEE_BPS)
      return totalTicketSales - (totalTicketSales * totalFeeBps) / BigInt(10000)
    }

    it('calculates 95% prize pool correctly', () => {
      const ticketSales = BigInt('1000000000000000000') // 1 ETH
      const prizePool = calculatePrizePool(ticketSales)
      expect(prizePool).toBe(BigInt('950000000000000000')) // 0.95 ETH
    })

    it('handles zero sales', () => {
      const prizePool = calculatePrizePool(BigInt(0))
      expect(prizePool).toBe(BigInt(0))
    })

    it('calculates fees for 0.01 ETH', () => {
      const ticketSales = BigInt('10000000000000000') // 0.01 ETH
      const prizePool = calculatePrizePool(ticketSales)
      expect(prizePool).toBe(BigInt('9500000000000000')) // 0.0095 ETH
    })
  })

  describe('Seller Deposit Calculation', () => {
    const SELLER_DEPOSIT_BPS = 1500 // 15%

    function calculateSellerDeposit(goalAmount: bigint, isRaffle: boolean): bigint {
      if (!isRaffle) return BigInt(0)
      return (goalAmount * BigInt(SELLER_DEPOSIT_BPS)) / BigInt(10000)
    }

    it('returns 0 for LOTTERY type', () => {
      const deposit = calculateSellerDeposit(BigInt('1000000000000000000'), false)
      expect(deposit).toBe(BigInt(0))
    })

    it('returns 15% for RAFFLE type', () => {
      const goalAmount = BigInt('1000000000000000000') // 1 ETH
      const deposit = calculateSellerDeposit(goalAmount, true)
      expect(deposit).toBe(BigInt('150000000000000000')) // 0.15 ETH
    })

    it('handles small goal amounts', () => {
      const goalAmount = BigInt('10000000000000000') // 0.01 ETH
      const deposit = calculateSellerDeposit(goalAmount, true)
      expect(deposit).toBe(BigInt('1500000000000000')) // 0.0015 ETH
    })

    it('handles zero goal amount', () => {
      const deposit = calculateSellerDeposit(BigInt(0), true)
      expect(deposit).toBe(BigInt(0))
    })
  })
})

describe('Address Validation', () => {
  function isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  it('validates correct Ethereum address', () => {
    expect(isValidAddress('0x1234567890123456789012345678901234567890')).toBe(true)
  })

  it('rejects address without 0x prefix', () => {
    expect(isValidAddress('1234567890123456789012345678901234567890')).toBe(false)
  })

  it('rejects address with wrong length', () => {
    expect(isValidAddress('0x123456')).toBe(false)
  })

  it('rejects address with invalid characters', () => {
    expect(isValidAddress('0xGGGG567890123456789012345678901234567890')).toBe(false)
  })

  it('validates lowercase address', () => {
    expect(isValidAddress('0xabcdef7890123456789012345678901234567890')).toBe(true)
  })

  it('validates uppercase address', () => {
    expect(isValidAddress('0xABCDEF7890123456789012345678901234567890')).toBe(true)
  })
})

describe('Wei Conversion', () => {
  function ethToWei(eth: number): bigint {
    return BigInt(Math.floor(eth * 1e18))
  }

  function weiToEth(wei: bigint): number {
    return Number(wei) / 1e18
  }

  it('converts 1 ETH to wei', () => {
    expect(ethToWei(1)).toBe(BigInt('1000000000000000000'))
  })

  it('converts 0.001 ETH to wei', () => {
    expect(ethToWei(0.001)).toBe(BigInt('1000000000000000'))
  })

  it('converts 0 ETH to wei', () => {
    expect(ethToWei(0)).toBe(BigInt(0))
  })

  it('converts wei back to ETH', () => {
    const wei = BigInt('1000000000000000000')
    expect(weiToEth(wei)).toBe(1)
  })

  it('handles precision for small amounts', () => {
    const eth = 0.000001
    const wei = ethToWei(eth)
    expect(wei).toBe(BigInt('1000000000000'))
  })

  it('handles floating point edge cases', () => {
    // 0.1 + 0.2 !== 0.3 in floating point
    const wei = ethToWei(0.1 + 0.2)
    // Should be approximately 0.3 ETH
    expect(wei).toBeGreaterThan(BigInt('299999999999999000'))
    expect(wei).toBeLessThan(BigInt('300000000000001000'))
  })
})
