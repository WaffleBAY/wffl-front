import { vi } from 'vitest'

// Mock wagmi hooks
export const mockWriteContract = vi.fn()
export const mockWriteContractAsync = vi.fn()
export const mockReset = vi.fn()

export const createMockWriteHook = (overrides = {}) => ({
  data: undefined as `0x${string}` | undefined,
  isPending: false,
  isSuccess: false,
  isError: false,
  error: null,
  writeContract: mockWriteContract,
  writeContractAsync: mockWriteContractAsync,
  reset: mockReset,
  ...overrides,
})

export const createMockSimulateHook = (overrides = {}) => ({
  data: {
    request: {
      address: '0x1234567890123456789012345678901234567890' as const,
      abi: [],
      functionName: 'test',
      args: [],
    },
  },
  isLoading: false,
  isError: false,
  error: null,
  ...overrides,
})

export const createMockReadHook = (data: unknown, overrides = {}) => ({
  data,
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
  ...overrides,
})

export const createMockReceiptHook = (overrides = {}) => ({
  data: undefined,
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
  ...overrides,
})

// Mock transaction logs for event parsing
export const createMockTransactionReceipt = (marketAddress: string) => ({
  transactionHash: '0xabcd' as `0x${string}`,
  blockNumber: 12345n,
  logs: [
    {
      address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
      topics: [
        '0x1234567890123456789012345678901234567890123456789012345678901234' as `0x${string}`,
      ],
      data: '0x' as `0x${string}`,
      blockNumber: 12345n,
      transactionHash: '0xabcd' as `0x${string}`,
      logIndex: 0,
      transactionIndex: 0,
      blockHash: '0xdef' as `0x${string}`,
      removed: false,
    },
  ],
  status: 'success' as const,
})

// Mock WorldID proof
export const createMockWorldIdProof = () => ({
  merkle_root: '0x1234567890123456789012345678901234567890123456789012345678901234',
  nullifier_hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  proof: '0x0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000007000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
  verification_level: 'orb',
})
