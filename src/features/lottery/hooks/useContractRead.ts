/**
 * Contract read hooks for WaffleMarket interactions.
 * These hooks wrap the generated wagmi hooks with proper chainId and enabled conditions.
 */

import type { Address } from 'viem'
import { CHAIN_ID } from '@/config/contracts'
import {
  useReadWaffleMarketStatus,
  useReadWaffleMarketTicketPrice,
  useReadWaffleMarketGoalAmount,
  useReadWaffleMarketPrizePool,
  useReadWaffleMarketGetParticipants,
  useReadWaffleMarketMType,
  useReadWaffleMarketEndTime,
  useReadWaffleMarketSeller,
  useReadWaffleMarketParticipantInfos,
  useReadWaffleMarketGetWinners,
  useReadWaffleMarketPreparedQuantity,
} from '@/contracts/generated'

/**
 * Hook to read multiple WaffleMarket contract values at once.
 * Returns status, ticketPrice, goalAmount, prizePool, participantCount, marketType, endTime, and seller.
 */
export function useLotteryContractData(marketAddress: Address | undefined) {
  const chainId = CHAIN_ID

  const { data: statusNum, isLoading: statusLoading } = useReadWaffleMarketStatus({
    address: marketAddress,
    chainId,
    query: { enabled: !!marketAddress },
  })

  const { data: ticketPrice, isLoading: priceLoading } = useReadWaffleMarketTicketPrice({
    address: marketAddress,
    chainId,
    query: { enabled: !!marketAddress },
  })

  const { data: goalAmount, isLoading: goalLoading } = useReadWaffleMarketGoalAmount({
    address: marketAddress,
    chainId,
    query: { enabled: !!marketAddress },
  })

  const { data: prizePool, isLoading: poolLoading } = useReadWaffleMarketPrizePool({
    address: marketAddress,
    chainId,
    query: { enabled: !!marketAddress },
  })

  const { data: participants, isLoading: participantsLoading } = useReadWaffleMarketGetParticipants({
    address: marketAddress,
    chainId,
    query: { enabled: !!marketAddress },
  })

  const { data: marketType, isLoading: typeLoading } = useReadWaffleMarketMType({
    address: marketAddress,
    chainId,
    query: { enabled: !!marketAddress },
  })

  const { data: endTime, isLoading: endTimeLoading } = useReadWaffleMarketEndTime({
    address: marketAddress,
    chainId,
    query: { enabled: !!marketAddress },
  })

  const { data: seller, isLoading: sellerLoading } = useReadWaffleMarketSeller({
    address: marketAddress,
    chainId,
    query: { enabled: !!marketAddress },
  })

  const { data: winners, isLoading: winnersLoading } = useReadWaffleMarketGetWinners({
    address: marketAddress,
    chainId,
    query: { enabled: !!marketAddress },
  })

  const { data: preparedQuantity, isLoading: preparedQuantityLoading } = useReadWaffleMarketPreparedQuantity({
    address: marketAddress,
    chainId,
    query: { enabled: !!marketAddress },
  })

  const isLoading =
    statusLoading ||
    priceLoading ||
    goalLoading ||
    poolLoading ||
    participantsLoading ||
    typeLoading ||
    endTimeLoading ||
    sellerLoading ||
    winnersLoading ||
    preparedQuantityLoading

  return {
    status: statusNum,
    ticketPrice,
    goalAmount,
    prizePool,
    participantCount: participants?.length ?? 0,
    participants,
    marketType,
    endTime,
    seller,
    winners,
    preparedQuantity,
    isLoading,
  }
}

/**
 * Hook to check a user's participation info in a WaffleMarket.
 * Returns hasEntered, isWinner, paidAmount, and depositRefunded.
 */
export function useParticipantInfo(
  marketAddress: Address | undefined,
  userAddress: Address | undefined
) {
  const { data, isLoading } = useReadWaffleMarketParticipantInfos({
    address: marketAddress,
    args: userAddress ? [userAddress] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: !!marketAddress && !!userAddress },
  })

  return {
    hasEntered: data?.[0] ?? false,
    isWinner: data?.[1] ?? false,
    paidAmount: data?.[2] ?? BigInt(0),
    depositRefunded: data?.[3] ?? false,
    isLoading,
  }
}
