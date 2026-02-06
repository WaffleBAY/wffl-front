import { getAddress, type Address } from 'viem'
import { waffleFactoryAbi, waffleMarketAbi } from '@/contracts/generated'

if (!process.env.NEXT_PUBLIC_WAFFLE_FACTORY_ADDRESS) {
  throw new Error('NEXT_PUBLIC_WAFFLE_FACTORY_ADDRESS is not defined')
}

// Default chain ID for the application
export const CHAIN_ID = 480 as const // World Chain Mainnet

// WLD Token address
export const WLD_TOKEN_ADDRESS = getAddress(
  process.env.NEXT_PUBLIC_WLD_TOKEN_ADDRESS || '0x2cFc85d8E48F8EAB294be644d9E25C3030863003'
)

// Permit2 canonical address (same on all chains)
export const PERMIT2_ADDRESS: Address = '0x000000000022D473030F116dDEE9F6B43aC78BA3'

export const CONTRACT_ADDRESSES = {
  waffleFactory: {
    // World Chain Mainnet
    480: getAddress(process.env.NEXT_PUBLIC_WAFFLE_FACTORY_ADDRESS),
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

export const PARTICIPANT_DEPOSIT = BigInt('5000000000000000000') // 5 WLD (5 * 1e18)
export const WORLD_FOUNDATION_FEE_BPS = 300 // 3%
export const OPS_WALLET_FEE_BPS = 200 // 2%
