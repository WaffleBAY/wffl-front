import { LotteryStatus, MarketType } from '../types/LotteryStatus'

/**
 * Maps contract MarketStatus (uint8 0-6) to frontend LotteryStatus enum
 * Contract: WaffleLib.MarketStatus
 */
export const MARKET_STATUS_MAP: Record<number, LotteryStatus> = {
  0: LotteryStatus.CREATED,
  1: LotteryStatus.OPEN,
  2: LotteryStatus.CLOSED,
  3: LotteryStatus.COMMITTED,
  4: LotteryStatus.REVEALED,
  5: LotteryStatus.COMPLETED,
  6: LotteryStatus.FAILED,
}

export function mapContractStatus(statusNum: number): LotteryStatus {
  const status = MARKET_STATUS_MAP[statusNum]
  if (status === undefined) {
    throw new Error(`Unknown contract status: ${statusNum}`)
  }
  return status
}

/**
 * Maps contract MarketType (uint8 0-1) to frontend MarketType enum
 * Contract: WaffleLib.MarketType
 */
export const MARKET_TYPE_MAP: Record<number, MarketType> = {
  0: MarketType.LOTTERY,
  1: MarketType.RAFFLE,
}

export function mapContractMarketType(typeNum: number): MarketType {
  const marketType = MARKET_TYPE_MAP[typeNum]
  if (marketType === undefined) {
    throw new Error(`Unknown contract market type: ${typeNum}`)
  }
  return marketType
}

/**
 * Reverse mapping: frontend enum to contract uint8
 */
export function statusToContractValue(status: LotteryStatus): number {
  const entry = Object.entries(MARKET_STATUS_MAP).find(([, v]) => v === status)
  if (!entry) {
    throw new Error(`Unknown status: ${status}`)
  }
  return parseInt(entry[0], 10)
}

export function marketTypeToContractValue(marketType: MarketType): number {
  return marketType === MarketType.LOTTERY ? 0 : 1
}
