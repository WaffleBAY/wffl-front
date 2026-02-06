import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getLotteryRepository } from '@/features/lottery/repository';
import { LotteryDetail } from '@/features/lottery/components/detail';

interface LotteryDetailPageProps {
  params: Promise<{ id: string }>;
}

// Get repository instance (Real or Mock based on env)
const repository = getLotteryRepository();

export async function generateMetadata({
  params,
}: LotteryDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const lottery = await repository.getById(id);

  if (!lottery) {
    return {
      title: '복권을 찾을 수 없습니다 | World Lottery',
    };
  }

  return {
    title: `${lottery.title} | World Lottery`,
    description: lottery.description,
  };
}

export default async function LotteryDetailPage({
  params,
}: LotteryDetailPageProps) {
  const { id } = await params;
  const lottery = await repository.getById(id);

  if (!lottery) {
    notFound();
  }

  return <LotteryDetail lottery={lottery} />;
}
