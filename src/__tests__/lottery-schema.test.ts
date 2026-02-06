import { describe, it, expect } from 'vitest'
import { lotteryCreateSchema, type LotteryCreateFormData } from '@/features/lottery/schemas/lotteryCreateSchema'
import { MarketType } from '@/features/lottery/types'

describe('lotteryCreateSchema', () => {
  const createValidFormData = (): LotteryCreateFormData => ({
    marketType: MarketType.LOTTERY,
    title: 'Test Lottery Title',
    description: 'This is a test lottery with enough description length.',
    imageFile: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
    entryPrice: 0.001,
    targetAmount: 0.01,
    winnerCount: 1,
    expiresAt: new Date(Date.now() + 86400000), // tomorrow
    shippingRegions: ['KR'],
  })

  describe('Valid inputs', () => {
    it('accepts valid lottery data', () => {
      const data = createValidFormData()
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('accepts valid raffle data', () => {
      const data = createValidFormData()
      data.marketType = MarketType.RAFFLE
      data.winnerCount = 5
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('accepts zero entry price (free lottery)', () => {
      const data = createValidFormData()
      data.entryPrice = 0
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('accepts zero target amount', () => {
      const data = createValidFormData()
      data.targetAmount = 0
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('accepts multiple shipping regions', () => {
      const data = createValidFormData()
      data.shippingRegions = ['KR', 'US', 'JP', 'WORLDWIDE']
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('Title validation', () => {
    it('rejects empty title', () => {
      const data = createValidFormData()
      data.title = ''
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('rejects title over 50 characters', () => {
      const data = createValidFormData()
      data.title = 'A'.repeat(51)
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('accepts title at exactly 50 characters', () => {
      const data = createValidFormData()
      data.title = 'A'.repeat(50)
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('Description validation', () => {
    it('rejects description under 10 characters', () => {
      const data = createValidFormData()
      data.description = 'Short'
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('rejects description over 500 characters', () => {
      const data = createValidFormData()
      data.description = 'A'.repeat(501)
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('accepts description at exactly 10 characters', () => {
      const data = createValidFormData()
      data.description = 'A'.repeat(10)
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('Entry price validation', () => {
    it('rejects negative entry price', () => {
      const data = createValidFormData()
      data.entryPrice = -1
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('rejects entry price over 100 WLD', () => {
      const data = createValidFormData()
      data.entryPrice = 101
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('accepts entry price at exactly 100 WLD', () => {
      const data = createValidFormData()
      data.entryPrice = 100
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('Target amount validation', () => {
    it('rejects negative target amount', () => {
      const data = createValidFormData()
      data.targetAmount = -1
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('Winner count validation', () => {
    it('rejects winner count of 0', () => {
      const data = createValidFormData()
      data.winnerCount = 0
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('rejects winner count over 100', () => {
      const data = createValidFormData()
      data.winnerCount = 101
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('rejects non-integer winner count', () => {
      const data = createValidFormData()
      data.winnerCount = 1.5
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('accepts winner count at exactly 100', () => {
      const data = createValidFormData()
      data.winnerCount = 100
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('Expires at validation', () => {
    it('rejects past date', () => {
      const data = createValidFormData()
      data.expiresAt = new Date(Date.now() - 3600000) // 1 hour ago
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('accepts future date', () => {
      const data = createValidFormData()
      data.expiresAt = new Date(Date.now() + 86400000 * 30) // 30 days from now
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('Shipping regions validation', () => {
    it('rejects empty shipping regions', () => {
      const data = createValidFormData()
      data.shippingRegions = []
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('Image file validation', () => {
    it('rejects file over 5MB', () => {
      const data = createValidFormData()
      // Create a mock large file
      const largeContent = new Array(6 * 1024 * 1024).fill('a').join('')
      data.imageFile = new File([largeContent], 'large.jpg', { type: 'image/jpeg' })
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('rejects unsupported file type', () => {
      const data = createValidFormData()
      data.imageFile = new File(['test'], 'test.gif', { type: 'image/gif' })
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('accepts JPEG file', () => {
      const data = createValidFormData()
      data.imageFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('accepts PNG file', () => {
      const data = createValidFormData()
      data.imageFile = new File(['test'], 'test.png', { type: 'image/png' })
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('accepts WebP file', () => {
      const data = createValidFormData()
      data.imageFile = new File(['test'], 'test.webp', { type: 'image/webp' })
      const result = lotteryCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })
})
