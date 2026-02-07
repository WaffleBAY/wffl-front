import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, parseEventLogs, decodeEventLog } from 'viem';
import { waffleFactoryAbi } from '@/contracts/generated';

const worldChainRpc = 'https://worldchain-mainnet.g.alchemy.com/public';

const publicClient = createPublicClient({
  chain: {
    id: 480,
    name: 'World Chain',
    nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
    rpcUrls: { default: { http: [worldChainRpc] } },
  },
  transport: http(worldChainRpc),
});

/**
 * Extract market address from raw log topics as fallback.
 * MarketCreated event: topic[0]=sig, topic[1]=marketId, topic[2]=marketAddress, topic[3]=seller
 */
function extractMarketAddressFromRawLogs(logs: { topics: string[]; data: string }[]): string | null {
  for (const log of logs) {
    // MarketCreated has 4 topics (event sig + 3 indexed params)
    if (log.topics.length === 4) {
      // topic[2] is the indexed marketAddress (padded to 32 bytes)
      const addressTopic = log.topics[2];
      if (addressTopic && addressTopic.length === 66) {
        // Extract address from 32-byte topic (last 20 bytes)
        const address = '0x' + addressTopic.slice(26);
        // Basic address validation
        if (address.length === 42) {
          return address;
        }
      }
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transactionId, txHash: clientTxHash } = body;

    if (!transactionId && !clientTxHash) {
      return NextResponse.json({ error: 'transactionId or txHash required' }, { status: 400 });
    }

    let txHash: `0x${string}` | null = clientTxHash || null;

    // If no txHash provided, get it from World Developer API
    if (!txHash) {
      const appId = process.env.NEXT_PUBLIC_APP_ID;
      const worldRes = await fetch(
        `https://developer.worldcoin.org/api/v2/minikit/transaction/${transactionId}?app_id=${appId}&type=transaction`
      );

      const worldText = await worldRes.text();

      if (!worldRes.ok) {
        return NextResponse.json({
          status: 'pending',
          message: 'Waiting for relayer',
          worldApiStatus: worldRes.status,
          worldApiBody: worldText.slice(0, 200),
        });
      }

      const worldData = JSON.parse(worldText);

      if (worldData.transactionStatus === 'failed') {
        return NextResponse.json({ status: 'failed', worldData });
      }

      if (!worldData.transactionHash) {
        return NextResponse.json({
          status: 'pending',
          transactionStatus: worldData.transactionStatus,
          worldData,
        });
      }

      txHash = worldData.transactionHash as `0x${string}`;
    }

    // Get receipt
    try {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 1,
        timeout: 15_000,
      });

      if (receipt.status === 'reverted') {
        return NextResponse.json({
          status: 'reverted',
          txHash,
          receiptStatus: receipt.status,
          gasUsed: receipt.gasUsed.toString(),
        });
      }

      // Try parsing MarketCreated event with ABI
      try {
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
      } catch {
        // ABI parsing failed, try fallback
      }

      // Fallback: extract market address from raw log topics
      const rawLogs = receipt.logs.map(l => ({
        topics: l.topics as string[],
        data: l.data,
      }));
      const fallbackAddress = extractMarketAddressFromRawLogs(rawLogs);

      if (fallbackAddress) {
        return NextResponse.json({
          status: 'success',
          txHash,
          marketAddress: fallbackAddress,
          parsedVia: 'raw_topics',
        });
      }

      return NextResponse.json({
        status: 'success_no_event',
        txHash,
        marketAddress: null,
        logCount: receipt.logs.length,
        receiptStatus: receipt.status,
        rawTopics: receipt.logs.map(l => l.topics),
      });
    } catch (receiptErr) {
      return NextResponse.json({
        status: 'mining',
        txHash,
        receiptError: receiptErr instanceof Error ? receiptErr.message : 'unknown',
      });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
