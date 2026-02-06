'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, type State } from 'wagmi'
import { useState, type ReactNode } from 'react'
import { getConfig } from '@/config/wagmi'

export function WagmiContextProvider({
  children,
  initialState,
}: {
  children: ReactNode
  initialState: State | undefined
}) {
  // Use useState to create config and queryClient ONCE
  // Creating outside useState causes infinite re-renders and lost cache
  const [config] = useState(() => getConfig())
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
