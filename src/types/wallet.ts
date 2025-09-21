// Transaction result type for Privy operations
export interface TransactionResult {
  hash: string
  status: 'pending' | 'confirmed' | 'failed'
  amount: string
  timestamp: number
}

// Aave lending position information
export interface AavePosition {
  supplied: string
  apy: string
  healthFactor: string
}