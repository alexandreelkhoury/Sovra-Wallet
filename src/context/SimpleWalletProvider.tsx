import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets'

type WalletMode = 'normal' | 'smart'

interface SimpleWalletState {
  isConnected: boolean
  address?: string
  isLoading: boolean
  isInjectedWallet: boolean
}

interface SimpleWalletContextType {
  walletState: SimpleWalletState
  walletMode: WalletMode
  setWalletMode: (mode: WalletMode) => void
  isSmartWalletAvailable: boolean
  useSmartWallet: boolean
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
  const { ready, authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  const { client: smartWalletClient } = useSmartWallets()
  
  const [walletState, setWalletState] = useState<SimpleWalletState>({
    isConnected: false,
    isLoading: true,
    isInjectedWallet: false,
  })

  // Check if smart wallet is available
  const smartWallet = user?.linkedAccounts?.find((account) => account.type === 'smart_wallet')
  const isSmartWalletAvailable = authenticated && !!smartWallet && !!smartWalletClient
  
  // Start with smart wallet if available, otherwise normal
  const [walletMode, setWalletMode] = useState<WalletMode>(
    isSmartWalletAvailable ? 'smart' : 'normal'
  )
  
  // Determine if we should use smart wallet
  const useSmartWallet = walletMode === 'smart' && isSmartWalletAvailable

  const handleSetWalletMode = (mode: WalletMode) => {
    setWalletMode(mode)
    console.log(`Demo mode switched to: ${mode === 'smart' ? 'Smart Wallet' : 'Normal Wallet'}`)
  }

  useEffect(() => {

    if (ready) {
      if (authenticated && wallets.length > 0) {
        let activeAddress: string
        let isInjected: boolean

        if (useSmartWallet && smartWallet) {
          // Use smart wallet address when in smart wallet mode
          activeAddress = smartWallet.address
          isInjected = false // Smart wallet is not injected
        } else {
          // Use regular wallet in normal mode
          const activeWallet = wallets.find(wallet => wallet.connectorType === 'injected') || wallets[0]
          activeAddress = activeWallet.address
          isInjected = activeWallet.connectorType === 'injected'
        }
        
        setWalletState({
          isConnected: true,
          address: activeAddress,
          isLoading: false,
          isInjectedWallet: isInjected,
        })
      } else {
        setWalletState({
          isConnected: false,
          isLoading: false,
          isInjectedWallet: false,
        })
      }
    }
  }, [ready, authenticated, wallets, walletMode, useSmartWallet, user, smartWallet])

  return (
    <SimpleWalletContext.Provider value={{ 
      walletState, 
      walletMode, 
      setWalletMode: handleSetWalletMode, 
      isSmartWalletAvailable, 
      useSmartWallet 
    }}>
      {children}
    </SimpleWalletContext.Provider>
  )
}