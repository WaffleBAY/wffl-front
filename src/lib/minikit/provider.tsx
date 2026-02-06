'use client';

import { MiniKit } from '@worldcoin/minikit-js';
import { ReactNode, useEffect } from 'react';

export function MiniKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_APP_ID;
    if (appId) {
      MiniKit.install(appId);
    } else {
      MiniKit.install();
    }
  }, []);

  return <>{children}</>;
}
