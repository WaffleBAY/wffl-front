import { LotteryStatus, MarketType } from '../types';
import { formatEther } from 'viem';

/**
 * Format WLD amount with Korean locale
 * @param weiAmount - Amount in wei as string or bigint
 */
export function formatWLD(weiAmount: string | bigint): string {
  const ether = formatEther(BigInt(weiAmount));
  const num = parseFloat(ether);
  return num.toLocaleString('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}


/**
 * Format countdown display in Korean (e.g., "3일 12시간 남음")
 */
export function formatCountdown(
  days: number,
  hours: number,
  minutes: number,
  seconds: number,
  isExpired: boolean
): string {
  if (isExpired) return '마감됨';

  if (days > 0) {
    return `${days}일 ${hours}시간 남음`;
  }
  if (hours > 0) {
    return `${hours}시간 ${minutes}분 남음`;
  }
  if (minutes > 0) {
    return `${minutes}분 ${seconds}초 남음`;
  }
  return `${seconds}초 남음`;
}

/**
 * Get Korean label for lottery status
 */
export function getStatusLabel(status: LotteryStatus): string {
  const labels: Record<LotteryStatus, string> = {
    [LotteryStatus.CREATED]: '생성됨',
    [LotteryStatus.OPEN]: '진행중',
    [LotteryStatus.CLOSED]: '마감',
    [LotteryStatus.REVEALED]: '당첨발표',
    [LotteryStatus.COMPLETED]: '완료',
    [LotteryStatus.FAILED]: '실패',
  };
  return labels[status];
}

/**
 * Get Korean label for market type
 */
export function getMarketTypeLabel(type: MarketType): string {
  const labels: Record<MarketType, string> = {
    [MarketType.LOTTERY]: '복권',
    [MarketType.RAFFLE]: '래플',
  };
  return labels[type];
}

/**
 * Get badge variant for lottery status (maps to shadcn Badge variants)
 */
export function getStatusBadgeVariant(
  status: LotteryStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case LotteryStatus.OPEN:
      return 'default'; // Primary color for active lotteries
    case LotteryStatus.REVEALED:
      return 'default'; // Highlight winners announced
    case LotteryStatus.COMPLETED:
      return 'secondary'; // Muted for completed
    case LotteryStatus.FAILED:
      return 'destructive'; // Red for failed
    default:
      return 'outline'; // Neutral for other states
  }
}

/**
 * Get icon name for lottery status (maps to lucide-react icon names)
 */
export function getStatusIcon(status: LotteryStatus): string {
  const icons: Record<LotteryStatus, string> = {
    [LotteryStatus.CREATED]: 'clock',
    [LotteryStatus.OPEN]: 'play',
    [LotteryStatus.CLOSED]: 'lock',
    [LotteryStatus.REVEALED]: 'trophy',
    [LotteryStatus.COMPLETED]: 'check',
    [LotteryStatus.FAILED]: 'x-circle',
  };
  return icons[status];
}

/**
 * Format Unix timestamp to Korean date string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format Unix timestamp to relative time (e.g., "3일 전")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const then = timestamp * 1000;
  const diff = now - then;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return '방금 전';
}
