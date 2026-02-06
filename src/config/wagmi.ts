import { createConfig, http, cookieStorage, createStorage } from 'wagmi'
import { defineChain } from 'viem'

// World Chain Mainnet (chain ID 480)
export const worldChain = defineChain({
  id: 480,
  name: 'World Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://worldchain-mainnet.g.alchemy.com/public'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Worldscan',
      url: 'https://worldscan.org',
    },
  },
})

// World Chain Sepolia (chain ID 4801)
export const worldChainSepolia = defineChain({
  id: 4801,
  name: 'World Chain Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://worldchain-sepolia.g.alchemy.com/public'],
    },
  },
  blockExplorers: {
    default: {
      name: 'World Chain Explorer',
      url: 'https://worldchain-sepolia.explorer.alchemy.com',
    },
  },
  testnet: true,
})

export function getConfig() {
  return createConfig({
    chains: [worldChain, worldChainSepolia],
    ssr: true, // CRITICAL for Next.js hydration
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [worldChain.id]: http(),
      [worldChainSepolia.id]: http(),
    },
  })
}

// TypeScript module augmentation for type safety
declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>
  }
}
