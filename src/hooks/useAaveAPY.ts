import { useState, useEffect, useCallback } from 'react'
import { usePublicClient } from 'wagmi'
import { formatUnits } from 'viem'
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
  const [apy, setApy] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const publicClient = usePublicClient()

  const fetchAPY = useCallback(async () => {
    if (!publicClient) {
      console.log('useAaveAPY: No public client available')
      return
    }

    console.log('useAaveAPY: Fetching real WETH supply APY from Aave V3')
    setIsLoading(true)
    setError(null)

    try {
      // Call Aave V3 Pool getReserveData for WETH
      const reserveData = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.AAVE_POOL,
        abi: AAVE_POOL_ABI,
        functionName: 'getReserveData',
        args: [CONTRACT_ADDRESSES.WETH],
      })

      // Extract the current liquidity rate (supply APY)
      // currentLiquidityRate is in ray units (27 decimal places)
      const liquidityRateRaw = reserveData.currentLiquidityRate as bigint
      
      // Convert from ray (27 decimals) to percentage
      // Formula: (liquidityRate / 10^27) * 100 to get percentage
      const liquidityRateDecimal = formatUnits(liquidityRateRaw, 27)
      const apyPercentage = parseFloat(liquidityRateDecimal) * 100

      console.log('useAaveAPY: Retrieved real APY data', {
        liquidityRateRaw: liquidityRateRaw.toString(),
        liquidityRateDecimal,
        apyPercentage: apyPercentage.toFixed(4)
      })

      setApy(apyPercentage)
    } catch (error) {
      console.error('useAaveAPY: Failed to fetch APY from Aave:', error)
      setError('Failed to fetch APY data')
      // Fallback to reasonable default
      setApy(3.2)
    } finally {
      setIsLoading(false)
    }
  }, [publicClient])

  useEffect(() => {
    if (publicClient) {
      fetchAPY()
    }
  }, [publicClient, fetchAPY])

  const formatAPY = (value: number | null): string => {
    if (value === null) return '--'
    return `${value.toFixed(2)}%`
  }

  return {
    apy,
    isLoading,
    error,
    formatAPY,
    refetch: fetchAPY
  }
}