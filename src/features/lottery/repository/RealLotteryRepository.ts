import apiClient from '@/lib/api/client';
import {
  ILotteryRepository,
  PaginationParams,
  PaginatedResult,
  FilterParams,
} from './ILotteryRepository';
import { Lottery, ParticipantInfo, CreateMarketParams, LotteryStatus, MarketType } from '../types';
import { AxiosError } from 'axios';
import { createPublicClient, http, type Address } from 'viem';
import { worldChain } from '@/config/wagmi';
import { waffleMarketAbi } from '@/contracts/generated';
import { PARTICIPANT_DEPOSIT } from '@/config/contracts';

/**
 * Backend DTO matching backend/src/lottery/dto/lottery-response.dto.ts
 */
interface BackendLotteryDto {
  id: string;
  title: string;
  description: string | null;
  prize: string;
  imageUrl: string | null;
  contractAddress: string | null;
  marketType: string;
  ticketPrice: string; // Wei string
  goalAmount: string; // Wei string
  sellerDeposit: string;
  prizePool: string;
  participantDeposit: string;
  preparedQuantity: number;
  endTime: string; // ISO date string
  duration: number | null;
  status: string;
  participantCount: number;
  winners: string[];
  shippingRegions: string[];
  region: string | null;
  creator: {
    id: string;
    username: string | null;
    profilePictureUrl: string | null;
  };
  entriesCount: number;
  createdAt: string;
}

interface BackendPaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface BackendLotteryListResponse {
  items: BackendLotteryDto[];
  pagination: BackendPaginationDto;
}

/**
 * Backend Entry Response DTO matching backend/src/user/dto/entry-response.dto.ts
 */
interface BackendEntryLotteryDto {
  id: string;
  title: string;
  description: string | null;
  prize: string;
  imageUrl: string | null;
  contractAddress: string | null;
  status: string;
  endTime: string;
  creator: {
    id: string;
    username: string | null;
    profilePictureUrl: string | null;
  };
}

interface BackendEntryDto {
  id: string;
  ticketCount: number;
  paidAmount: string;
  isWinner: boolean;
  depositRefunded: boolean;
  createdAt: string;
  lottery: BackendEntryLotteryDto;
}

interface BackendEntryListResponse {
  items: BackendEntryDto[];
  pagination: BackendPaginationDto;
}

/**
 * Map entry lottery DTO to frontend Lottery type
 * Used for user entries/winnings where lottery data is simplified
 */
function mapEntryLotteryToFrontend(dto: BackendEntryLotteryDto): Lottery {
  // Parse end time to Unix timestamp
  const endTime = Math.floor(new Date(dto.endTime).getTime() / 1000);

  // Map backend status to LotteryStatus enum
  const statusMap: Record<string, LotteryStatus> = {
    CREATED: LotteryStatus.CREATED,
    OPEN: LotteryStatus.OPEN,
    CLOSED: LotteryStatus.CLOSED,

    REVEALED: LotteryStatus.REVEALED,
    COMPLETED: LotteryStatus.COMPLETED,
    FAILED: LotteryStatus.FAILED,
    PENDING: LotteryStatus.CREATED,
    ACTIVE: LotteryStatus.OPEN,
    ENDED: LotteryStatus.CLOSED,
  };

  return {
    id: dto.id,
    contractAddress: dto.contractAddress ?? dto.id, // Use contractAddress if available, else ID as placeholder
    title: dto.title,
    description: dto.description ?? '',
    imageUrl: dto.imageUrl ?? '',
    prizeDescription: dto.prize,
    marketType: MarketType.LOTTERY,
    ticketPrice: '0', // Not provided in simplified DTO
    participantDeposit: PARTICIPANT_DEPOSIT.toString(),
    sellerDeposit: '0',
    prizePool: '0', // Not provided in simplified DTO
    goalAmount: '0', // Not provided in simplified DTO
    preparedQuantity: 1,
    endTime,
    status: statusMap[dto.status] ?? LotteryStatus.CREATED,
    participantCount: 0, // Not provided in simplified DTO
    seller: dto.creator.id,
    winners: [],
    shippingRegions: ['WORLDWIDE'],
    createdAt: '', // Not provided in simplified DTO
  };
}

/**
 * Map backend DTO to frontend Lottery type (contract-aligned)
 */
function mapBackendToFrontend(dto: BackendLotteryDto): Lottery {
  // Parse end time to Unix timestamp
  const endTime = dto.endTime
    ? Math.floor(new Date(dto.endTime).getTime() / 1000)
    : 0;

  // Map backend status to LotteryStatus enum
  const statusMap: Record<string, LotteryStatus> = {
    CREATED: LotteryStatus.CREATED,
    OPEN: LotteryStatus.OPEN,
    CLOSED: LotteryStatus.CLOSED,
    REVEALED: LotteryStatus.REVEALED,
    COMPLETED: LotteryStatus.COMPLETED,
    FAILED: LotteryStatus.FAILED,
    PENDING: LotteryStatus.CREATED,
    ACTIVE: LotteryStatus.OPEN,
    ENDED: LotteryStatus.CLOSED,
  };

  return {
    id: dto.id,
    contractAddress: dto.contractAddress ?? dto.id,
    title: dto.title,
    description: dto.description ?? '',
    imageUrl: dto.imageUrl ?? '',
    prizeDescription: dto.prize,
    marketType: dto.marketType === 'RAFFLE' ? MarketType.RAFFLE : MarketType.LOTTERY,
    ticketPrice: dto.ticketPrice ?? '0',
    participantDeposit: dto.participantDeposit ?? '0',
    sellerDeposit: dto.sellerDeposit ?? '0',
    prizePool: dto.prizePool ?? '0',
    goalAmount: dto.goalAmount ?? '0',
    preparedQuantity: dto.preparedQuantity ?? 1,
    endTime,
    status: statusMap[dto.status] ?? LotteryStatus.CREATED,
    participantCount: dto.participantCount ?? dto.entriesCount ?? 0,
    seller: dto.creator.id,
    winners: dto.winners ?? [],
    shippingRegions: dto.shippingRegions?.length ? dto.shippingRegions : (dto.region ? [dto.region] : ['WORLDWIDE']),
    createdAt: dto.createdAt,
  };
}

// Lazy client initialization to avoid SSR issues
let publicClient: ReturnType<typeof createPublicClient> | null = null;

function getPublicClient() {
  if (!publicClient) {
    publicClient = createPublicClient({
      chain: worldChain,
      transport: http(),
    });
  }
  return publicClient;
}

export class RealLotteryRepository implements ILotteryRepository {
  async getAll(params: PaginationParams, filter?: FilterParams): Promise<PaginatedResult<Lottery>> {
    const queryParams: Record<string, string | number> = {
      page: params.page,
      limit: params.limit,
    };

    if (filter?.status && filter.status !== 'all') {
      queryParams.status = filter.status;
    }
    if (filter?.region) {
      queryParams.region = filter.region;
    }

    const { data } = await apiClient.get<BackendLotteryListResponse>('/lotteries', {
      params: queryParams,
    });

    return {
      items: data.items.map(mapBackendToFrontend),
      total: data.pagination.total,
      page: data.pagination.page,
      totalPages: data.pagination.totalPages,
    };
  }

  async getById(id: string): Promise<Lottery | null> {
    try {
      const { data } = await apiClient.get<BackendLotteryDto>(`/lotteries/${id}`);
      return mapBackendToFrontend(data);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getByContractAddress(address: string): Promise<Lottery | null> {
    // Backend doesn't have contract address lookup yet
    // Will be implemented in backend schema update phase
    return null;
  }

  async getByStatus(
    status: LotteryStatus,
    params: PaginationParams
  ): Promise<PaginatedResult<Lottery>> {
    const { data } = await apiClient.get<BackendLotteryListResponse>('/lotteries', {
      params: {
        page: params.page,
        limit: params.limit,
        status,
      },
    });

    return {
      items: data.items.map(mapBackendToFrontend),
      total: data.pagination.total,
      page: data.pagination.page,
      totalPages: data.pagination.totalPages,
    };
  }

  async create(input: CreateMarketParams & { contractAddress?: string }): Promise<Lottery> {
    const { data } = await apiClient.post<BackendLotteryDto>('/lotteries', {
      title: input.title,
      description: input.description,
      prize: input.prizeDescription,
      imageUrl: input.imageUrl,
      marketType: input.marketType,
      ticketPrice: input.ticketPrice, // Already in wei string
      goalAmount: input.goalAmount,   // Already in wei string
      preparedQuantity: input.preparedQuantity,
      duration: input.duration,
      endTime: Math.floor(Date.now() / 1000) + input.duration, // Unix timestamp
      shippingRegions: input.shippingRegions,
      contractAddress: input.contractAddress, // Pass contract address to backend
    });

    return mapBackendToFrontend(data);
  }

  async getParticipantInfo(
    lotteryId: string,
    address: string
  ): Promise<ParticipantInfo | null> {
    const lottery = await this.getById(lotteryId);
    if (!lottery?.contractAddress || lottery.contractAddress === lotteryId) {
      // No contract deployed yet (contractAddress is placeholder)
      return null;
    }

    try {
      const client = getPublicClient();
      const data = await client.readContract({
        address: lottery.contractAddress as Address,
        abi: waffleMarketAbi,
        functionName: 'participantInfos',
        args: [address as Address],
      });

      return {
        address,
        hasEntered: data[0],
        isWinner: data[1],
        paidAmount: data[2].toString(),
        depositRefunded: data[3],
      };
    } catch (error) {
      console.error('Failed to read participant info from contract:', error);
      return null;
    }
  }

  async getParticipants(lotteryId: string): Promise<string[]> {
    const lottery = await this.getById(lotteryId);
    if (!lottery?.contractAddress || lottery.contractAddress === lotteryId) {
      // No contract deployed yet (contractAddress is placeholder)
      return [];
    }

    try {
      const client = getPublicClient();
      const participants = await client.readContract({
        address: lottery.contractAddress as Address,
        abi: waffleMarketAbi,
        functionName: 'getParticipants',
      });
      return [...participants]; // Convert readonly array to mutable
    } catch (error) {
      console.error('Failed to read participants from contract:', error);
      return [];
    }
  }

  async getWinners(lotteryId: string): Promise<string[]> {
    const lottery = await this.getById(lotteryId);
    if (!lottery?.contractAddress || lottery.contractAddress === lotteryId) {
      // No contract deployed yet (contractAddress is placeholder)
      return [];
    }

    try {
      const client = getPublicClient();
      const winners = await client.readContract({
        address: lottery.contractAddress as Address,
        abi: waffleMarketAbi,
        functionName: 'getWinners',
      });
      return [...winners]; // Convert readonly array to mutable
    } catch (error) {
      console.error('Failed to read winners from contract:', error);
      return [];
    }
  }

  async getMyLotteries(
    address: string,
    params: PaginationParams
  ): Promise<PaginatedResult<Lottery>> {
    // Backend doesn't have dedicated endpoint yet
    // Fetch all and filter client-side
    const { data } = await apiClient.get<BackendLotteryListResponse>('/lotteries', {
      params: {
        page: params.page,
        limit: params.limit,
      },
    });

    const myLotteries = data.items
      .filter((item) => item.creator.id === address)
      .map(mapBackendToFrontend);

    return {
      items: myLotteries,
      total: myLotteries.length,
      page: params.page,
      totalPages: Math.ceil(myLotteries.length / params.limit),
    };
  }

  async getMyParticipations(
    _address: string,
    params: PaginationParams
  ): Promise<PaginatedResult<Lottery>> {
    const { data } = await apiClient.get<BackendEntryListResponse>('/users/me/entries', {
      params: { page: params.page, limit: params.limit },
    });

    return {
      items: data.items.map((entry) => mapEntryLotteryToFrontend(entry.lottery)),
      total: data.pagination.total,
      page: data.pagination.page,
      totalPages: data.pagination.totalPages,
    };
  }

  async getMyWinnings(
    _address: string,
    params: PaginationParams
  ): Promise<PaginatedResult<Lottery>> {
    const { data } = await apiClient.get<BackendEntryListResponse>('/users/me/winnings', {
      params: { page: params.page, limit: params.limit },
    });

    return {
      items: data.items.map((entry) => mapEntryLotteryToFrontend(entry.lottery)),
      total: data.pagination.total,
      page: data.pagination.page,
      totalPages: data.pagination.totalPages,
    };
  }

  async openMarket(_lotteryId: string): Promise<void> {
    // This will be a contract call in wagmi integration phase
    // Backend stub for now
    throw new Error('openMarket requires contract integration');
  }

  async enter(
    lotteryId: string,
    _root: string,
    _nullifierHash: string,
    _proof: string[],
    _value: string
  ): Promise<void> {
    // Backend entry for tracking (contract call will be separate)
    await apiClient.post(`/lotteries/${lotteryId}/entries`, {});
  }

  async settle(_lotteryId: string): Promise<void> {
    // This will be a contract call in wagmi integration phase
    throw new Error('settle requires contract integration');
  }

  async claimRefund(_lotteryId: string): Promise<void> {
    // This will be a contract call in wagmi integration phase
    throw new Error('claimRefund requires contract integration');
  }
}
