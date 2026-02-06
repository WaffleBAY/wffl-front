import { getAddress, type Address } from 'viem'
import { waffleFactoryAbi, waffleMarketAbi } from '@/contracts/generated'

if (!process.env.NEXT_PUBLIC_WAFFLE_FACTORY_ADDRESS) {
  throw new Error('NEXT_PUBLIC_WAFFLE_FACTORY_ADDRESS is not defined')
}

// Default chain ID for the application
export const CHAIN_ID = 4801 as const // World Chain Sepolia (testnet)

export const CONTRACT_ADDRESSES = {
  waffleFactory: {
    // World Chain Sepolia (testnet)
    4801: getAddress(process.env.NEXT_PUBLIC_WAFFLE_FACTORY_ADDRESS),
  },
} as const

export function getWaffleFactoryAddress(chainId: number): Address {
  const address = CONTRACT_ADDRESSES.waffleFactory[chainId as keyof typeof CONTRACT_ADDRESSES.waffleFactory]
  if (!address) {
    throw new Error(`WaffleFactory not deployed on chain ${chainId}`)
  }
  return address
}

/**
 * Returns a WaffleMarket contract config for a specific market address.
 * Use this with wagmi hooks that need dynamic contract addresses.
 */
export function getWaffleMarketConfig(marketAddress: Address) {
  return {
    abi: waffleMarketAbi,
    address: marketAddress,
  } as const
}

/**
 * WaffleFactory contract config.
 * Note: Address is chain-dependent, use getWaffleFactoryAddress(chainId) to get the address.
 */
export const waffleFactoryConfig = {
  abi: waffleFactoryAbi,
  // address is chain-dependent, use getWaffleFactoryAddress(chainId)
} as const

export const PARTICIPANT_DEPOSIT = BigInt('5000000000000000') // 0.005 ETH in wei
export const WORLD_FOUNDATION_FEE_BPS = 300 // 3%
export const OPS_WALLET_FEE_BPS = 200 // 2%
