'use client';

import { MiniKit } from '@worldcoin/minikit-js';
import { ReactNode, useEffect, useState } from 'react';

export function MiniKitProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const appId = process.env.NEXT_PUBLIC_APP_ID;
        MiniKit.install(appId || undefined);
        // Wait for MiniKit to fully initialize (like HAVO reference)
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error('MiniKit initialization error:', error);
      } finally {
        setIsReady(true);
      }
    };
    init();
  }, []);

  if (!isReady) return null;

  return <>{children}</>;
}
