import { ILotteryRepository } from './ILotteryRepository';
import { RealLotteryRepository } from './RealLotteryRepository';
import { MockLotteryRepository } from '../mock/MockLotteryRepository';

export type {
  ILotteryRepository,
  PaginationParams,
  PaginatedResult,
  FilterParams,
} from './ILotteryRepository';

// Singleton instance for repository
let repositoryInstance: ILotteryRepository | null = null;

/**
 * Factory function to get the appropriate lottery repository.
 * Returns MockLotteryRepository when NEXT_PUBLIC_USE_MOCK=true,
 * otherwise returns RealLotteryRepository for backend API calls.
 */
export function getLotteryRepository(): ILotteryRepository {
  if (!repositoryInstance) {
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
    repositoryInstance = useMock
      ? new MockLotteryRepository()
      : new RealLotteryRepository();
  }
  return repositoryInstance;
}
