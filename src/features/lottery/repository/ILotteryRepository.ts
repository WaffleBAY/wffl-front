import { Lottery, LotteryStatus, MarketType, ParticipantInfo, CreateMarketParams } from '../types';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface FilterParams {
  status?: LotteryStatus | 'all';
  marketType?: MarketType;
  region?: string;
}

export interface ILotteryRepository {
  // Market creation (calls WaffleFactory.createMarket)
  create(data: CreateMarketParams): Promise<Lottery>;

  // Market queries
  getAll(params: PaginationParams, filter?: FilterParams): Promise<PaginatedResult<Lottery>>;
  getById(id: string): Promise<Lottery | null>;
  getByContractAddress(address: string): Promise<Lottery | null>;
  getByStatus(status: LotteryStatus, params: PaginationParams): Promise<PaginatedResult<Lottery>>;

  // Participant info (from contract)
  getParticipantInfo(lotteryId: string, address: string): Promise<ParticipantInfo | null>;
  getParticipants(lotteryId: string): Promise<string[]>;
  getWinners(lotteryId: string): Promise<string[]>;

  // User-specific queries
  getMyLotteries(address: string, params: PaginationParams): Promise<PaginatedResult<Lottery>>;
  getMyParticipations(address: string, params: PaginationParams): Promise<PaginatedResult<Lottery>>;
  getMyWinnings(address: string, params: PaginationParams): Promise<PaginatedResult<Lottery>>;

  // Contract actions (seller)
  openMarket(lotteryId: string): Promise<void>;

  // Contract actions (participant)
  enter(
    lotteryId: string,
    root: string,
    nullifierHash: string,
    proof: string[],
    value: string
  ): Promise<void>;

  // Contract actions (winner)
  confirmReceipt(lotteryId: string): Promise<void>;

  // Contract actions (anyone after failure or non-winner after reveal)
  claimRefund(lotteryId: string): Promise<void>;
}
