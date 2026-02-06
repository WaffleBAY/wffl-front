import { vi, beforeAll, afterAll, afterEach } from 'vitest'

// Must set env vars before any imports
vi.stubEnv('NEXT_PUBLIC_WAFFLE_FACTORY_ADDRESS', '0x1234567890123456789012345678901234567890')
vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001')

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}))

// Mock MiniKit
vi.mock('@worldcoin/minikit-js', () => ({
  MiniKit: {
    isInstalled: vi.fn(() => true),
    commandsAsync: {
      verify: vi.fn(),
      walletAuth: vi.fn(),
    },
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  },
  VerificationLevel: {
    Orb: 'orb',
    Device: 'device',
  },
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

afterEach(() => {
  vi.clearAllMocks()
})

afterAll(() => {
  vi.unstubAllEnvs()
})
