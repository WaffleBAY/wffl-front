'use client';

import { Jazzicon } from '@ukstv/jazzicon-react';
import { useAuthStore } from '../store/useAuthStore';
import { abbreviateAddress } from '../utils/address';
import { WorldIdBadge } from './WorldIdBadge';

/**
 * ProfileCard component displays user profile information
 * - Jazzicon avatar based on wallet address
 * - Abbreviated wallet address
 * - WorldID verification status badge
 */
export function ProfileCard() {
  const walletAddress = useAuthStore((state) => state.walletAddress);
  const isWorldIdVerified = useAuthStore((state) => state.isWorldIdVerified);

  // Defensive: if no wallet address, show nothing
  // This should not happen if AuthGuard is working correctly
  if (!walletAddress) {
    return null;
  }

  return (
    <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Jazzicon Avatar */}
      <div className="h-16 w-16 overflow-hidden rounded-full">
        <Jazzicon address={walletAddress} />
      </div>

      {/* Abbreviated Wallet Address */}
      <p className="mt-3 font-mono text-lg text-gray-900">
        {abbreviateAddress(walletAddress)}
      </p>

      {/* WorldID Verification Badge */}
      <div className="mt-2">
        <WorldIdBadge verified={isWorldIdVerified} />
      </div>
    </div>
  );
}
