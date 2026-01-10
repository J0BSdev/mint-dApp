'use client'

import '@rainbow-me/rainbowkit/styles.css'

import { ReactNode, useMemo } from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Providers komponenta - wrap-uje aplikaciju sa Wagmi, QueryClient i RainbowKit
 * 
 * Zašto zasebna komponenta?
 * - Next.js 16 zahtijeva da <html> i <body> tagovi budu u server komponenti (layout.tsx)
 * - Wagmi i RainbowKit moraju biti 'use client' jer koriste React hooks
 * - Ova separacija omogućava Next.js optimizacije
 */
export function Providers({ children }: { children: ReactNode }) {
  // Kreiraj Wagmi config samo jednom (useMemo osigurava da se ne rekreira na svaki render)
  const wagmiConfig = useMemo(() => {
    const { connectors } = getDefaultWallets({
      appName: 'JobsNFT',
      projectId: "12bc234e3c11db5955da7361c9ba34dc",
    })

    return createConfig({
      chains: [mainnet, sepolia],
      transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
      },
      connectors: connectors,
      ssr: true,
    })
  }, [])

  // Kreiraj QueryClient samo jednom
  const queryClient = useMemo(() => new QueryClient(), [])

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

