export interface SwapParams {
  tokenIn: string
  tokenOut: string
  amountIn: string
  minAmountOut: string
  recipient: string
  deadline?: number
  slippageTolerance?: number // percentage (0.5 = 0.5%)
}

export interface SwapQuote {
  amountOut: string
  priceImpact: string
  minimumAmountOut: string
  route: string[]
  fee: number
  gasEstimate?: string
}

export interface SwapResult {
  hash: string
  status: 'pending' | 'confirmed' | 'failed'
  amountIn: string
  amountOut: string
  timestamp: number
  gasUsed?: string
}

export interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI?: string
}

export interface SwapSettings {
  slippageTolerance: number // percentage
  deadline: number // minutes
  gasPrice?: string
}

export interface PoolInfo {
  address: string
  token0: string
  token1: string
  fee: number
  liquidity: string
  sqrtPriceX96: string
}

// Common token addresses on Base Sepolia
export const BASE_SEPOLIA_TOKENS = {
  WETH: '0x4200000000000000000000000000000000000006',
  USDT: '0xf46318aa5d26a20683ae2390ea2777efc22cf89f',
} as const

// Router addresses for Base Sepolia
export const SWAP_ROUTERS = {
  UNISWAP_V3_ROUTER: '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45', // SwapRouter02
  UNISWAP_V3_ROUTER_ALT: '0xe592427a0aece92de3edee1f18e0157c05861564', // SwapRouter
  CUSTOM_ROUTER: '0x6682375ebC1dF04676c0c5050934272368e6e883', // Detected router
} as const

// Pool fee tiers (in basis points)
export const POOL_FEES = {
  LOW: 500,    // 0.05%
  MEDIUM: 3000, // 0.3%
  HIGH: 10000,  // 1%
} as const