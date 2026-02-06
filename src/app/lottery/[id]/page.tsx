'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getLotteryRepository } from '@/features/lottery/repository';
import { LotteryDetail } from '@/features/lottery/components/detail';
import type { Lottery } from '@/features/lottery/types';

export default function LotteryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [lottery, setLottery] = useState<Lottery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchLottery = async () => {
      try {
        const repository = getLotteryRepository();
        const data = await repository.getById(id);
        if (!data) {
          setError(true);
        } else {
          setLottery(data);
        }
      } catch (err) {
        console.error('Failed to fetch lottery:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchLottery();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
      </div>
    );
  }

  if (error || !lottery) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-muted-foreground">복권을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return <LotteryDetail lottery={lottery} />;
}
