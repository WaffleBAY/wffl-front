'use client';

import Image from 'next/image';
import { Jazzicon } from '@ukstv/jazzicon-react';
import { abbreviateAddress } from '@/features/auth/utils/address';
import { WorldIdBadge } from '@/features/auth/components/WorldIdBadge';
import { useUserProfile } from '@/features/user';

interface SellerInfoProps {
  sellerAddress: string;
  isVerified?: boolean;
}

export function SellerInfo({ sellerAddress, isVerified = true }: SellerInfoProps) {
  const { profile, isLoading } = useUserProfile(sellerAddress);

  return (
    <div className="px-4">
      <p className="mb-3 text-sm text-muted-foreground">판매자 정보</p>
      <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
        {/* Seller avatar */}
        <div className="h-10 w-10 overflow-hidden rounded-full flex-shrink-0">
          {profile?.profilePictureUrl ? (
            <Image
              src={profile.profilePictureUrl}
              alt={profile.username || 'Seller'}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <Jazzicon address={sellerAddress} />
          )}
        </div>

        {/* Seller username or address */}
        {isLoading ? (
          <span className="h-4 w-24 animate-pulse rounded bg-muted" />
        ) : profile?.username ? (
          <span className="text-sm text-foreground">@{profile.username}</span>
        ) : (
          <span className="font-mono text-sm text-foreground">
            {abbreviateAddress(sellerAddress)}
          </span>
        )}

        {/* WorldID verification badge */}
        <div className="ml-auto">
          <WorldIdBadge verified={isVerified} />
        </div>
      </div>
    </div>
  );
}
