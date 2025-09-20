export interface PrivyConfig {
  appId: string
  environment: 'sandbox' | 'production'
  network: 'base-sepolia' | 'base' | 'ethereum' | 'polygon'
  chainId?: number
}

export interface WalletProvider {
  address: string
  chainId: number
  isConnected: boolean
}

export interface TokenBalance {
  symbol: string
  balance: string
  decimals: number
  contractAddress: string
}

export interface AaveSupplyParams {
  asset: string
  amount: string
  onBehalfOf?: string
}

export interface PrivyError {
  code: string
  message: string
  details?: any
}