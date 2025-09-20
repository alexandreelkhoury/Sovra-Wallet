export interface WalletState {
  isConnected: boolean
  address: string | null
  ethBalance: string
  usdcBalance: string
  isLoading: boolean
  error: string | null
}

export interface TransactionResult {
  hash: string
  status: 'pending' | 'confirmed' | 'failed'
  amount: string
  timestamp: number
}

export interface AavePosition {
  supplied: string
  apy: string
  healthFactor: string
}