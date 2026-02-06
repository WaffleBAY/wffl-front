import { describe, it, expect } from 'vitest'
import { MarketType } from '@/features/lottery/types'
import type { LotteryCreateFormData } from '@/features/lottery/schemas/lotteryCreateSchema'

/**
 * Test the conversion logic that transforms form data to contract parameters.
 * This is critical for ensuring amounts are correctly converted to wei.
 */
describe('Create Lottery - Form to Contract Conversion', () => {
  // Helper to replicate the conversion logic from useCreateLottery
  function convertFormToContractParams(data: LotteryCreateFormData) {
    const now = Date.now()
    const expiresAt = data.expiresAt.getTime()
    const durationSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000))

    // Convert ETH to wei
    const ticketPriceWei = BigInt(Math.floor(data.entryPrice * 1e18))
    const goalAmountWei = BigInt(Math.floor(data.targetAmount * 1e18))

    // Calculate seller deposit for RAFFLE (15% of goalAmount)
    const sellerDeposit = data.marketType === MarketType.RAFFLE
      ? (goalAmountWei * BigInt(15)) / BigInt(100)
      : BigInt(0)

    // Map marketType to contract enum (0 = LOTTERY, 1 = RAFFLE)
    const mTypeNum = data.marketType === MarketType.LOTTERY ? 0 : 1

    return {
      mTypeNum,
      ticketPriceWei,
      goalAmountWei,
      preparedQuantity: BigInt(data.winnerCount),
      durationSeconds: BigInt(durationSeconds),
      sellerDeposit,
    }
  }

  const baseFormData: LotteryCreateFormData = {
    marketType: MarketType.LOTTERY,
    title: 'Test Lottery',
    description: 'Test description for lottery',
    imageFile: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
    entryPrice: 0.001,
    targetAmount: 0.01,
    winnerCount: 1,
    expiresAt: new Date(Date.now() + 86400000), // +24h
    shippingRegions: ['KR'],
  }

  describe('Entry Price (ticketPrice) Conversion', () => {
    it('converts 0.001 ETH to wei correctly', () => {
      const result = convertFormToContractParams(baseFormData)
      expect(result.ticketPriceWei).toBe(BigInt('1000000000000000'))
    })

    it('converts 0 ETH to 0 wei (free lottery)', () => {
      const formData = { ...baseFormData, entryPrice: 0 }
      const result = convertFormToContractParams(formData)
      expect(result.ticketPriceWei).toBe(BigInt(0))
    })

    it('converts 1 ETH to wei correctly', () => {
      const formData = { ...baseFormData, entryPrice: 1 }
      const result = convertFormToContractParams(formData)
      expect(result.ticketPriceWei).toBe(BigInt('1000000000000000000'))
    })

    it('converts 0.0001 ETH (small amount) correctly', () => {
      const formData = { ...baseFormData, entryPrice: 0.0001 }
      const result = convertFormToContractParams(formData)
      expect(result.ticketPriceWei).toBe(BigInt('100000000000000'))
    })

    it('converts 100 ETH (max) correctly', () => {
      const formData = { ...baseFormData, entryPrice: 100 }
      const result = convertFormToContractParams(formData)
      expect(result.ticketPriceWei).toBe(BigInt('100000000000000000000'))
    })

    it('handles floating point precision (0.123456789)', () => {
      const formData = { ...baseFormData, entryPrice: 0.123456789 }
      const result = convertFormToContractParams(formData)
      // Math.floor should truncate at 18 decimal places
      expect(result.ticketPriceWei).toBe(BigInt('123456789000000000'))
    })
  })

  describe('Target Amount (goalAmount) Conversion', () => {
    it('converts 0.01 ETH to wei correctly', () => {
      const result = convertFormToContractParams(baseFormData)
      expect(result.goalAmountWei).toBe(BigInt('10000000000000000'))
    })

    it('converts 0 ETH to 0 wei (no goal)', () => {
      const formData = { ...baseFormData, targetAmount: 0 }
      const result = convertFormToContractParams(formData)
      expect(result.goalAmountWei).toBe(BigInt(0))
    })

    it('converts 10 ETH to wei correctly', () => {
      const formData = { ...baseFormData, targetAmount: 10 }
      const result = convertFormToContractParams(formData)
      expect(result.goalAmountWei).toBe(BigInt('10000000000000000000'))
    })
  })

  describe('Market Type Conversion', () => {
    it('converts LOTTERY to 0', () => {
      const result = convertFormToContractParams(baseFormData)
      expect(result.mTypeNum).toBe(0)
    })

    it('converts RAFFLE to 1', () => {
      const formData = { ...baseFormData, marketType: MarketType.RAFFLE }
      const result = convertFormToContractParams(formData)
      expect(result.mTypeNum).toBe(1)
    })
  })

  describe('Seller Deposit Calculation', () => {
    it('returns 0 for LOTTERY type', () => {
      const result = convertFormToContractParams(baseFormData)
      expect(result.sellerDeposit).toBe(BigInt(0))
    })

    it('returns 15% of goalAmount for RAFFLE type', () => {
      const formData = {
        ...baseFormData,
        marketType: MarketType.RAFFLE,
        targetAmount: 1, // 1 ETH
      }
      const result = convertFormToContractParams(formData)
      // 15% of 1 ETH = 0.15 ETH = 150000000000000000 wei
      expect(result.sellerDeposit).toBe(BigInt('150000000000000000'))
    })

    it('returns 0 deposit for RAFFLE with 0 goal', () => {
      const formData = {
        ...baseFormData,
        marketType: MarketType.RAFFLE,
        targetAmount: 0,
      }
      const result = convertFormToContractParams(formData)
      expect(result.sellerDeposit).toBe(BigInt(0))
    })

    it('calculates 15% correctly for 0.1 ETH goal', () => {
      const formData = {
        ...baseFormData,
        marketType: MarketType.RAFFLE,
        targetAmount: 0.1, // 0.1 ETH
      }
      const result = convertFormToContractParams(formData)
      // 15% of 0.1 ETH = 0.015 ETH = 15000000000000000 wei
      expect(result.sellerDeposit).toBe(BigInt('15000000000000000'))
    })
  })

  describe('Duration Calculation', () => {
    it('calculates positive duration for future date', () => {
      const futureDate = new Date(Date.now() + 86400000) // +24h
      const formData = { ...baseFormData, expiresAt: futureDate }
      const result = convertFormToContractParams(formData)
      // Should be approximately 86400 seconds (allow some margin for test execution time)
      expect(result.durationSeconds).toBeGreaterThan(BigInt(86300))
      expect(result.durationSeconds).toBeLessThanOrEqual(BigInt(86400))
    })

    it('returns 0 for past date', () => {
      const pastDate = new Date(Date.now() - 3600000) // -1h
      const formData = { ...baseFormData, expiresAt: pastDate }
      const result = convertFormToContractParams(formData)
      expect(result.durationSeconds).toBe(BigInt(0))
    })

    it('handles very short duration', () => {
      const nearFuture = new Date(Date.now() + 60000) // +1 minute
      const formData = { ...baseFormData, expiresAt: nearFuture }
      const result = convertFormToContractParams(formData)
      expect(result.durationSeconds).toBeGreaterThan(BigInt(50))
      expect(result.durationSeconds).toBeLessThanOrEqual(BigInt(60))
    })
  })

  describe('Prepared Quantity', () => {
    it('converts winner count to BigInt', () => {
      const result = convertFormToContractParams(baseFormData)
      expect(result.preparedQuantity).toBe(BigInt(1))
    })

    it('handles multiple winners', () => {
      const formData = { ...baseFormData, winnerCount: 10 }
      const result = convertFormToContractParams(formData)
      expect(result.preparedQuantity).toBe(BigInt(10))
    })

    it('handles max winners (100)', () => {
      const formData = { ...baseFormData, winnerCount: 100 }
      const result = convertFormToContractParams(formData)
      expect(result.preparedQuantity).toBe(BigInt(100))
    })
  })
})

describe('Create Lottery - Edge Cases', () => {
  it('handles minimum valid lottery (all zeros except required)', () => {
    const formData: LotteryCreateFormData = {
      marketType: MarketType.LOTTERY,
      title: 'Free Lottery',
      description: 'A completely free lottery experience',
      imageFile: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
      entryPrice: 0,
      targetAmount: 0,
      winnerCount: 1,
      expiresAt: new Date(Date.now() + 86400000),
      shippingRegions: ['KR'],
    }

    // Should be valid
    const ticketPriceWei = BigInt(Math.floor(formData.entryPrice * 1e18))
    const goalAmountWei = BigInt(Math.floor(formData.targetAmount * 1e18))

    expect(ticketPriceWei).toBe(BigInt(0))
    expect(goalAmountWei).toBe(BigInt(0))
  })

  it('handles maximum valid values', () => {
    const formData: LotteryCreateFormData = {
      marketType: MarketType.RAFFLE,
      title: 'A'.repeat(50), // Max title
      description: 'A'.repeat(500), // Max description
      imageFile: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
      entryPrice: 100, // Max entry
      targetAmount: 1000, // High but safe for floating point
      winnerCount: 100, // Max winners
      expiresAt: new Date(Date.now() + 365 * 86400000), // 1 year
      shippingRegions: ['WORLDWIDE'],
    }

    const ticketPriceWei = BigInt(Math.floor(formData.entryPrice * 1e18))
    const goalAmountWei = BigInt(Math.floor(formData.targetAmount * 1e18))

    expect(ticketPriceWei).toBe(BigInt('100000000000000000000')) // 100 ETH
    expect(goalAmountWei).toBe(BigInt('1000000000000000000000')) // 1000 ETH
  })

  it('handles floating point precision limits', () => {
    // JavaScript Number can safely represent integers up to 2^53-1
    // When multiplying by 1e18, large values will lose precision
    // This test documents the expected behavior (not necessarily ideal)

    // Safe: small values have exact precision
    const smallEth = 100
    const smallWei = BigInt(Math.floor(smallEth * 1e18))
    expect(smallWei).toBe(BigInt('100000000000000000000'))

    // Potentially lossy: very large values may have slight drift
    // The actual application should never need values > 100 ETH per schema
    const largeEth = 9007
    const largeWei = BigInt(Math.floor(largeEth * 1e18))
    // Allow some precision loss for large values
    const expected = BigInt(largeEth) * BigInt('1000000000000000000')
    const diff = largeWei > expected ? largeWei - expected : expected - largeWei
    // Precision loss should be very small relative to the value
    expect(diff).toBeLessThan(BigInt('1000000000')) // Less than 1 gwei difference
  })
})
