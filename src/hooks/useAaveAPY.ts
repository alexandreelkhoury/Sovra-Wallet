import { useReadContract } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../config/privy'

// Aave V3 Pool contract ABI for getReserveData
const AAVE_POOL_ABI = [
  {
    inputs: [{ name: 'asset', type: 'address' }],
    name: 'getReserveData',
    outputs: [
      {
        components: [
          { name: 'configuration', type: 'uint256' },
          { name: 'liquidityIndex', type: 'uint128' },
          { name: 'currentLiquidityRate', type: 'uint128' },
          { name: 'variableBorrowIndex', type: 'uint128' },
          { name: 'currentVariableBorrowRate', type: 'uint128' },
          { name: 'currentStableBorrowRate', type: 'uint128' },
          { name: 'lastUpdateTimestamp', type: 'uint40' },
          { name: 'id', type: 'uint16' },
          { name: 'aTokenAddress', type: 'address' },
          { name: 'stableDebtTokenAddress', type: 'address' },
          { name: 'variableDebtTokenAddress', type: 'address' },
          { name: 'interestRateStrategyAddress', type: 'address' },
          { name: 'accruedToTreasury', type: 'uint128' },
          { name: 'unbacked', type: 'uint128' },
          { name: 'isolationModeTotalDebt', type: 'uint128' }
        ],
        name: 'reserveData',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const

export function useAaveAPY() {
  const { 
    data: reserveData, 
    isLoading, 
    error: contractError, 
    refetch 
  } = useReadContract({
    address: CONTRACT_ADDRESSES.AAVE_POOL,
    abi: AAVE_POOL_ABI,
    functionName: 'getReserveData',
    args: [CONTRACT_ADDRESSES.WETH],
    query: {
      staleTime: 60_000, // Cache for 1 minute
      refetchOnWindowFocus: false,
    }
  })

  // Process the data to calculate APY
  const apy = reserveData ? (() => {
    try {
      // Extract the current liquidity rate (supply rate per second)
      // currentLiquidityRate is in ray units (27 decimal places)
      const liquidityRateRaw = reserveData.currentLiquidityRate as bigint
      
      // Aave APY calculation constants
      const RAY = BigInt(10) ** BigInt(27) // 10^27
      const SECONDS_PER_YEAR = 31536000 // 365 * 24 * 60 * 60
      
      // Convert from RAY units to decimal APR
      const liquidityRateDecimal = Number(liquidityRateRaw) / Number(RAY)
      
      // Calculate APY using compound interest formula
      // APY = ((1 + (APR / SECONDS_PER_YEAR)) ^ SECONDS_PER_YEAR) - 1
      const ratePerSecond = liquidityRateDecimal / SECONDS_PER_YEAR
      const compoundedRate = Math.pow(1 + ratePerSecond, SECONDS_PER_YEAR)
      const apyDecimal = compoundedRate - 1
      const apyPercentage = apyDecimal * 100

      return apyPercentage
    } catch (error) {
      console.error('useAaveAPY: Failed to process APY data:', error)
      return 3.2 // Fallback default
    }
  })() : null

  const formatAPY = (value: number | null): string => {
    if (value === null) return '--'
    return `${value.toFixed(2)}%`
  }

  return {
    apy,
    isLoading,
    error: contractError?.message || null,
    formatAPY,
    refetch
  }
}