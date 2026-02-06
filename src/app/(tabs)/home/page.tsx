'use client';

import { useEffect, useState } from 'react';
import { getLotteryRepository } from '@/features/lottery/repository';
import { LotteryList } from '@/features/lottery/components';
import { RegionInitializer } from '@/features/region';
import type { Lottery } from '@/features/lottery/types';

export default function HomePage() {
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLotteries = async () => {
      try {
        const repository = getLotteryRepository();
        const { items } = await repository.getAll({ page: 1, limit: 50 });
        setLotteries(items);
      } catch (error) {
        console.error('Failed to fetch lotteries:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLotteries();
  }, []);

  return (
    <div className="p-4">
      <RegionInitializer />
      <h1 className="text-2xl font-bold mb-4">복권 목록</h1>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
        </div>
      ) : (
        <LotteryList lotteries={lotteries} />
      )}
    </div>
  );
}
