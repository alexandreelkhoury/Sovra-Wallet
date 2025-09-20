import { useState, useEffect } from 'react'
import { aaveAPI } from '../services/aaveAPI'

export function useAaveAPY() {
  const [apy, setApy] = useState<number | null>(null)
  const [priceUSD, setPriceUSD] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAPYData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [apyData, priceData] = await Promise.all([
        aaveAPI.getWETHSupplyAPY(),
        aaveAPI.getWETHPriceUSD()
      ])

      setApy(apyData)
      setPriceUSD(priceData)
    } catch (err) {
      console.error('Failed to fetch APY data:', err)
      setError('Failed to load APY data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAPYData()

    // Refresh APY data every 60 seconds
    const interval = setInterval(fetchAPYData, 60000)
    return () => clearInterval(interval)
  }, [])

  const formatAPY = (value: number | null): string => {
    if (value === null) return '--'
    return `${value.toFixed(2)}%`
  }

  const formatPrice = (value: number | null): string => {
    if (value === null) return '--'
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const convertWETHToUSD = (wethAmount: string | number): string => {
    if (priceUSD === null) return '--'
    const amount = typeof wethAmount === 'string' ? parseFloat(wethAmount) : wethAmount
    if (isNaN(amount)) return '--'
    
    const usdValue = amount * priceUSD
    return `$${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return {
    apy,
    priceUSD,
    isLoading,
    error,
    formatAPY,
    formatPrice,
    convertWETHToUSD,
    refetch: fetchAPYData
  }
}