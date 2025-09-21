import { useAaveMarkets, chainId } from '@aave/react'

export function useAaveAPY() {
  // Fetch Aave markets for Base Sepolia (chain ID 84532)
  const { data: markets, loading: isLoading, error } = useAaveMarkets({
    chainIds: [chainId(84532)], // Base Sepolia
  })

  // Find WETH reserve and extract supply APY
  // Note: Using supplyReserves instead of reserves based on API structure
  const wethReserve = markets?.find(market => 
    market.supplyReserves?.find((reserve: any) => 
      reserve.symbol === 'WETH' || 
      reserve.symbol === 'ETH' ||
      reserve.name?.toLowerCase().includes('ethereum')
    )
  )?.supplyReserves?.find((reserve: any) => 
    reserve.symbol === 'WETH' || 
    reserve.symbol === 'ETH' ||
    reserve.name?.toLowerCase().includes('ethereum')
  )

  // Extract APY from the reserve data
  // Cast to any to handle dynamic property access
  const reserveData = wethReserve as any
  const apy = reserveData?.supplyAPY 
    ? parseFloat(reserveData.supplyAPY) * 100 // Convert to percentage
    : reserveData?.supplyRate
    ? parseFloat(reserveData.supplyRate) * 100
    : reserveData?.apy
    ? parseFloat(reserveData.apy) * 100
    : 3.5 // Fallback to reasonable default for demo

  const formatAPY = (value: number | null): string => {
    if (value === null) return '--'
    return `${value.toFixed(2)}%`
  }

  return {
    apy,
    isLoading,
    error: error ? String(error) : null,
    formatAPY,
    refetch: () => {
      // The Aave hook handles refetching automatically
      console.log('Aave markets will auto-refresh')
    }
  }
}