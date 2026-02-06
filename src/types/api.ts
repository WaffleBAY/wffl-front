import { Lottery, Participant, LotteryStatus } from '@/features/lottery/types';

// ============================================
// 공통 타입
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// 복권 조회 API
// ============================================

export interface GetLotteriesRequest {
  page?: number;
  limit?: number;
  status?: LotteryStatus;
  sortBy?: 'latest' | 'endingSoon' | 'participants';
}

export interface GetLotteriesResponse {
  lotteries: Lottery[];
  pagination: PaginationMeta;
}

export interface GetLotteryDetailRequest {
  id: string;
}

export interface GetLotteryDetailResponse {
  lottery: Lottery;
  participants: Participant[];
  userParticipation?: Participant; // 현재 사용자의 참여 정보
}

// ============================================
// 응모 API
// ============================================

export interface EnterLotteryRequest {
  lotteryId: string;
  worldIdProof: {
    merkle_root: string;
    nullifier_hash: string;
    proof: string;
    verification_level: 'orb' | 'device';
  };
}

export interface EnterLotteryResponse {
  participation: Participant;
  lottery: Lottery; // 업데이트된 복권 상태
  transactionHash?: string;
}

// ============================================
// 복권 생성 API
// ============================================

export interface CreateLotteryRequest {
  title: string;
  description: string;
  prizeDescription: string;
  imageUrl: string;
  entryPrice: number; // WLD
  targetAmount: number; // WLD
  depositAmount: number; // WLD (경품 가격의 10~20%)
  maxParticipants: number | null;
  winnerCount: number;
  endDate: string; // ISO 8601
}

export interface CreateLotteryResponse {
  lottery: Lottery;
  transactionHash?: string;
}

// ============================================
// 배송/분쟁 API
// ============================================

export interface ShipLotteryRequest {
  lotteryId: string;
  trackingNumber?: string;
  shippingCompany?: string;
}

export interface ShipLotteryResponse {
  lottery: Lottery;
}

export interface ConfirmReceivedRequest {
  lotteryId: string;
}

export interface ConfirmReceivedResponse {
  lottery: Lottery;
  transactionHash?: string; // 보증금 반환 트랜잭션
}

export interface ClaimDisputeRequest {
  lotteryId: string;
  reason: string;
}

export interface ClaimDisputeResponse {
  lottery: Lottery;
  disputeResult: 'burned' | 'pending'; // MAD 메커니즘: 분쟁 시 전액 소각
}

// ============================================
// 마이페이지 API
// ============================================

export interface GetMyParticipationsRequest {
  page?: number;
  limit?: number;
}

export interface GetMyParticipationsResponse {
  participations: Array<{
    participation: Participant;
    lottery: Lottery;
  }>;
  pagination: PaginationMeta;
}

export interface GetMyLotteriesRequest {
  page?: number;
  limit?: number;
  status?: LotteryStatus;
}

export interface GetMyLotteriesResponse {
  lotteries: Lottery[];
  pagination: PaginationMeta;
}

// ============================================
// 인증 API (World MiniKit)
// ============================================

export interface WalletAuthRequest {
  nonce: string;
  statement?: string;
}

export interface WalletAuthResponse {
  address: string;
  signature: string;
}

export interface VerifyWorldIdRequest {
  action: string; // 예: 'enter_lottery'
  signal?: string;
}

export interface VerifyWorldIdResponse {
  merkle_root: string;
  nullifier_hash: string;
  proof: string;
  verification_level: 'orb' | 'device';
}
