import React, { createContext, useContext, ReactNode } from 'react'
import { useWETHBalance } from '../hooks/useWETHBalance'

interface WETHBalanceContextType {
  balance: string
  isLoading: boolean
  error: string | null
  refetch: () => void
  userAddress?: string
}

const WETHBalanceContext = createContext<WETHBalanceContextType | null>(null)

interface WETHBalanceProviderProps {
  children: ReactNode
}

export const WETHBalanceProvider: React.FC<WETHBalanceProviderProps> = ({ children }) => {
  const wethBalance = useWETHBalance()

  return (
    <WETHBalanceContext.Provider value={wethBalance}>
      {children}
    </WETHBalanceContext.Provider>
  )
}

export const useWETHBalanceContext = () => {
  const context = useContext(WETHBalanceContext)
  if (!context) {
    throw new Error('useWETHBalanceContext must be used within a WETHBalanceProvider')
  }
  return context
}