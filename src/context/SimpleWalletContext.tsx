import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'

interface SimpleWalletState {
  isConnected: boolean
  address?: string
  isLoading: boolean
}

interface SimpleWalletContextType {
  walletState: SimpleWalletState
}

const SimpleWalletContext = createContext<SimpleWalletContextType | undefined>(undefined)

export const useWallet = () => {
  const context = useContext(SimpleWalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a SimpleWalletProvider')
  }
  return context
}

interface SimpleWalletProviderProps {
  children: ReactNode
}

export const SimpleWalletProvider: React.FC<SimpleWalletProviderProps> = ({ children }) => {
  const { ready, authenticated } = usePrivy()
  const { wallets } = useWallets()
  
  const [walletState, setWalletState] = useState<SimpleWalletState>({
    isConnected: false,
    isLoading: true,
  })

  useEffect(() => {
    console.log('SimpleWalletProvider effect:', { ready, authenticated, walletsCount: wallets.length })

    if (ready) {
      if (authenticated && wallets.length > 0) {
        // Prioritize injected wallets (Rabby, MetaMask, etc.) over embedded
        const activeWallet = wallets.find(wallet => wallet.connectorType === 'injected') || wallets[0]
        
        setWalletState({
          isConnected: true,
          address: activeWallet.address,
          isLoading: false,
        })
      } else {
        setWalletState({
          isConnected: false,
          isLoading: false,
        })
      }
    }
  }, [ready, authenticated, wallets])

  return (
    <SimpleWalletContext.Provider value={{ walletState }}>
      {children}
    </SimpleWalletContext.Provider>
  )
}