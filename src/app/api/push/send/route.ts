import { NextResponse } from 'next/server';
import { sendPush } from '@/features/push/services/pushService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { walletAddresses, notificationType, lotteryId } = body;

    // Validation
    if (!walletAddresses?.length || !notificationType || !lotteryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Valid notification types
    const validTypes = ['WIN', 'SHIPPED', 'DELIVERED', 'DRAW_SOON'];
    if (!validTypes.includes(notificationType)) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    await sendPush({ walletAddresses, notificationType, lotteryId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
