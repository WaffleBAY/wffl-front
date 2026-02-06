/**
 * Market status enum - matches WaffleLib.MarketStatus from smart contract
 * @see wffl-contract/src/libraries/WaffleLib.sol
 */
export enum LotteryStatus {
  CREATED = 'CREATED',       // 생성됨 (판매자가 openMarket 호출 전)
  OPEN = 'OPEN',             // 응모 진행 중
  CLOSED = 'CLOSED',         // 마감됨 (reveal 대기)
  REVEALED = 'REVEALED',     // 당첨자 확정 (settle 대기)
  COMPLETED = 'COMPLETED',   // 정산 완료
  FAILED = 'FAILED',         // 목표 미달 또는 타임아웃
}

/**
 * Market type enum - matches WaffleLib.MarketType from smart contract
 */
export enum MarketType {
  LOTTERY = 'LOTTERY',   // 목표액 기반 (1인 당첨)
  RAFFLE = 'RAFFLE',     // 준비 수량 기반 (다수 당첨)
}

/**
 * Valid state transitions for UI validation
 * Based on WaffleMarket.sol state machine
 */
export const VALID_TRANSITIONS: Record<LotteryStatus, LotteryStatus[]> = {
  [LotteryStatus.CREATED]: [LotteryStatus.OPEN],
  [LotteryStatus.OPEN]: [LotteryStatus.CLOSED, LotteryStatus.FAILED],
  [LotteryStatus.CLOSED]: [LotteryStatus.REVEALED, LotteryStatus.FAILED],
  [LotteryStatus.REVEALED]: [LotteryStatus.COMPLETED],
  [LotteryStatus.COMPLETED]: [],
  [LotteryStatus.FAILED]: [],
};

/**
 * Check if market is in a terminal state
 */
export function isTerminalStatus(status: LotteryStatus): boolean {
  return status === LotteryStatus.COMPLETED || status === LotteryStatus.FAILED;
}

/**
 * Check if market accepts entries
 */
export function isEntryOpen(status: LotteryStatus): boolean {
  return status === LotteryStatus.OPEN;
}

/**
 * Check if settle can be called (after winners revealed)
 */
export function canSettle(status: LotteryStatus): boolean {
  return status === LotteryStatus.REVEALED;
}

/**
 * Check if refunds are available
 * FAILED: deposit + pool share returned
 * COMPLETED: deposit only returned (for all participants)
 */
export function canClaimRefund(status: LotteryStatus): boolean {
  return status === LotteryStatus.FAILED || status === LotteryStatus.COMPLETED;
}
