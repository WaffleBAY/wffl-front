import {
  ILotteryRepository,
  PaginationParams,
  PaginatedResult,
  FilterParams,
} from '../repository/ILotteryRepository';
import { Lottery, ParticipantInfo, CreateMarketParams, LotteryStatus, MarketType } from '../types';
import { MOCK_LOTTERIES, CURRENT_USER_ADDRESS } from './mockData';
import { parseEther } from 'viem';

// Helper to convert ETH to wei string
const toWei = (eth: number) => parseEther(eth.toString()).toString();

export class MockLotteryRepository implements ILotteryRepository {
  private lotteries: Lottery[] = [...MOCK_LOTTERIES];

  private paginate<T>(items: T[], params: PaginationParams): PaginatedResult<T> {
    const { page, limit } = params;
    const start = (page - 1) * limit;
    const paginatedItems = items.slice(start, start + limit);

    return {
      items: paginatedItems,
      total: items.length,
      page,
      totalPages: Math.ceil(items.length / limit),
    };
  }

  async create(data: CreateMarketParams): Promise<Lottery> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const now = Math.floor(Date.now() / 1000);
    const mockContractAddress = `0x${Math.random().toString(16).slice(2, 10).padEnd(40, '0')}`;

    // Calculate sellerDeposit: 15% of goalAmount for RAFFLE, 0 for LOTTERY
    const sellerDeposit =
      data.marketType === MarketType.RAFFLE
        ? ((BigInt(data.goalAmount) * BigInt(15)) / BigInt(100)).toString()
        : '0';

    const newLottery: Lottery = {
      id: `lottery-${Date.now()}`,
      contractAddress: mockContractAddress,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      prizeDescription: data.prizeDescription,
      marketType: data.marketType,
      ticketPrice: data.ticketPrice,
      participantDeposit: toWei(0.005), // Fixed 0.005 ETH
      sellerDeposit,
      prizePool: '0',
      goalAmount: data.goalAmount,
      preparedQuantity: data.preparedQuantity,
      endTime: now + data.duration,
      status: LotteryStatus.CREATED, // Not OPEN - seller must call openMarket
      participantCount: 0,
      seller: CURRENT_USER_ADDRESS,
      winners: [],
      shippingRegions: data.shippingRegions,
      createdAt: new Date().toISOString(),
    };

    // Add to mock data (in real impl, this would persist)
    this.lotteries.push(newLottery);

    return newLottery;
  }

  async getAll(params: PaginationParams, filter?: FilterParams): Promise<PaginatedResult<Lottery>> {
    let filtered = this.lotteries;

    if (filter) {
      if (filter.status && filter.status !== 'all') {
        filtered = filtered.filter((l) => l.status === filter.status);
      }
      if (filter.marketType) {
        filtered = filtered.filter((l) => l.marketType === filter.marketType);
      }
      if (filter.region) {
        filtered = filtered.filter(
          (l) =>
            l.shippingRegions.includes(filter.region!) ||
            l.shippingRegions.includes('WORLDWIDE')
        );
      }
    }

    return this.paginate(filtered, params);
  }

  async getById(id: string): Promise<Lottery | null> {
    return this.lotteries.find((l) => l.id === id) ?? null;
  }

  async getByContractAddress(address: string): Promise<Lottery | null> {
    return (
      this.lotteries.find(
        (l) => l.contractAddress.toLowerCase() === address.toLowerCase()
      ) ?? null
    );
  }

  async getByStatus(
    status: LotteryStatus,
    params: PaginationParams
  ): Promise<PaginatedResult<Lottery>> {
    const filtered = this.lotteries.filter((l) => l.status === status);
    return this.paginate(filtered, params);
  }

  async getParticipantInfo(
    lotteryId: string,
    address: string
  ): Promise<ParticipantInfo | null> {
    const lottery = this.lotteries.find((l) => l.id === lotteryId);
    if (!lottery) return null;

    // Mock: current user has entered all OPEN/CLOSED/COMMITTED/REVEALED lotteries
    const hasEntered =
      address.toLowerCase() === CURRENT_USER_ADDRESS.toLowerCase() &&
      lottery.participantCount > 0;

    const isWinner = lottery.winners.some(
      (w) => w.toLowerCase() === address.toLowerCase()
    );

    const ticketPrice = BigInt(lottery.ticketPrice);
    const participantDeposit = BigInt(lottery.participantDeposit);

    return {
      address,
      hasEntered,
      isWinner,
      paidAmount: hasEntered ? (ticketPrice + participantDeposit).toString() : '0',
      depositRefunded:
        lottery.status === LotteryStatus.COMPLETED ||
        lottery.status === LotteryStatus.FAILED,
    };
  }

  async getParticipants(lotteryId: string): Promise<string[]> {
    const lottery = this.lotteries.find((l) => l.id === lotteryId);
    if (!lottery) return [];

    // Generate mock participant addresses based on participantCount
    const addresses: string[] = [];
    for (let i = 0; i < lottery.participantCount; i++) {
      addresses.push(`0x${(i + 1).toString(16).padStart(40, '0')}`);
    }
    return addresses;
  }

  async getWinners(lotteryId: string): Promise<string[]> {
    const lottery = this.lotteries.find((l) => l.id === lotteryId);
    return lottery?.winners ?? [];
  }

  async getMyLotteries(
    address: string,
    params: PaginationParams
  ): Promise<PaginatedResult<Lottery>> {
    const myLotteries = this.lotteries.filter(
      (l) => l.seller.toLowerCase() === address.toLowerCase()
    );
    return this.paginate(myLotteries, params);
  }

  async getMyParticipations(
    address: string,
    params: PaginationParams
  ): Promise<PaginatedResult<Lottery>> {
    // Mock: user has participated in some lotteries
    const participated = this.lotteries.filter(
      (l) =>
        l.participantCount > 0 &&
        address.toLowerCase() === CURRENT_USER_ADDRESS.toLowerCase()
    );
    return this.paginate(participated, params);
  }

  async getMyWinnings(
    address: string,
    params: PaginationParams
  ): Promise<PaginatedResult<Lottery>> {
    const winnings = this.lotteries.filter((l) =>
      l.winners.some((w) => w.toLowerCase() === address.toLowerCase())
    );
    return this.paginate(winnings, params);
  }

  async openMarket(lotteryId: string): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const lottery = this.lotteries.find((l) => l.id === lotteryId);
    if (!lottery) {
      throw new Error(`Lottery not found: ${lotteryId}`);
    }

    if (lottery.status !== LotteryStatus.CREATED) {
      throw new Error(`Cannot open market in status: ${lottery.status}`);
    }

    lottery.status = LotteryStatus.OPEN;
    lottery.openedAt = new Date().toISOString();
  }

  async enter(
    lotteryId: string,
    _root: string,
    _nullifierHash: string,
    _proof: string[],
    value: string
  ): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const lottery = this.lotteries.find((l) => l.id === lotteryId);
    if (!lottery) {
      throw new Error(`Lottery not found: ${lotteryId}`);
    }

    if (lottery.status !== LotteryStatus.OPEN) {
      throw new Error(`Cannot enter lottery in status: ${lottery.status}`);
    }

    // Update lottery state
    lottery.participantCount += 1;

    // Add to prize pool (95% of ticket price, 5% is fees)
    const ticketPrice = BigInt(lottery.ticketPrice);
    const currentPrizePool = BigInt(lottery.prizePool);
    const prizePoolAddition = (ticketPrice * BigInt(95)) / BigInt(100);
    lottery.prizePool = (currentPrizePool + prizePoolAddition).toString();
  }

  async confirmReceipt(lotteryId: string): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const lottery = this.lotteries.find((l) => l.id === lotteryId);
    if (!lottery) {
      throw new Error(`Lottery not found: ${lotteryId}`);
    }

    if (lottery.status !== LotteryStatus.REVEALED) {
      throw new Error(`Cannot confirm receipt for lottery in status: ${lottery.status}`);
    }

    lottery.status = LotteryStatus.COMPLETED;
    lottery.completedAt = new Date().toISOString();
  }

  async claimRefund(lotteryId: string): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const lottery = this.lotteries.find((l) => l.id === lotteryId);
    if (!lottery) {
      throw new Error(`Lottery not found: ${lotteryId}`);
    }

    if (
      lottery.status !== LotteryStatus.FAILED &&
      lottery.status !== LotteryStatus.REVEALED
    ) {
      throw new Error(`Cannot claim refund for lottery in status: ${lottery.status}`);
    }

    // In real implementation, this would update participant's deposit status
    // Mock just logs success
  }
}
