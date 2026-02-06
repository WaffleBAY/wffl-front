import { getLotteryRepository } from '@/features/lottery/repository';
import { LotteryList } from '@/features/lottery/components';
import { RegionInitializer } from '@/features/region';

// Force dynamic rendering - don't pre-render during build
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch all lotteries from repository (Real or Mock based on env)
  const repository = getLotteryRepository();
  const { items: lotteries } = await repository.getAll({ page: 1, limit: 50 });

  return (
    <div className="p-4">
      {/* Initialize region detection on first visit */}
      <RegionInitializer />
      <h1 className="text-2xl font-bold mb-4">복권 목록</h1>
      <LotteryList lotteries={lotteries} />
    </div>
  );
}
