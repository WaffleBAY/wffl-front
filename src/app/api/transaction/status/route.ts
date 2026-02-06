import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, parseEventLogs } from 'viem';
import { waffleFactoryAbi } from '@/contracts/generated';

const worldChainSepoliaRpc = 'https://worldchain-sepolia.g.alchemy.com/public';

const publicClient = createPublicClient({
  chain: {
    id: 4801,
    name: 'World Chain Sepolia',
    nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
    rpcUrls: { default: { http: [worldChainSepoliaRpc] } },
  },
  transport: http(worldChainSepoliaRpc),
});

export async function POST(req: NextRequest) {
  try {
    const { transactionId } = await req.json();

    if (!transactionId) {
      return NextResponse.json({ error: 'transactionId required' }, { status: 400 });
    }

    const appId = process.env.NEXT_PUBLIC_APP_ID;

    // Step 1: Get real tx hash from World Developer API
    const worldRes = await fetch(
      `https://developer.worldcoin.org/api/v2/minikit/transaction/${transactionId}?app_id=${appId}&type=transaction`
    );

    if (!worldRes.ok) {
      return NextResponse.json({
        status: 'pending',
        message: 'Waiting for relayer',
      });
    }

    const worldData = await worldRes.json();

    if (worldData.transactionStatus === 'failed') {
      return NextResponse.json({ status: 'failed' });
    }

    if (!worldData.transactionHash) {
      return NextResponse.json({
        status: 'pending',
        transactionStatus: worldData.transactionStatus,
      });
    }

    const txHash = worldData.transactionHash as `0x${string}`;

    // Step 2: Try to get receipt
    try {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 1,
        timeout: 10_000,
      });

      if (receipt.status === 'reverted') {
        return NextResponse.json({ status: 'reverted', txHash });
      }

      // Parse MarketCreated event
      const logs = parseEventLogs({
        abi: waffleFactoryAbi,
        eventName: 'MarketCreated',
        logs: receipt.logs,
      });

      if (logs.length > 0) {
        const marketAddress = logs[0].args.marketAddress;
        return NextResponse.json({
          status: 'success',
          txHash,
          marketAddress,
        });
      }

      return NextResponse.json({
        status: 'success',
        txHash,
        marketAddress: null,
        logCount: receipt.logs.length,
      });
    } catch {
      // Receipt not available yet but we have the hash
      return NextResponse.json({
        status: 'mining',
        txHash,
      });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
