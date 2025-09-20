// Aave API service for fetching real-time APY data
const AAVE_API_BASE = 'https://aave-api-v2.aave.com'
const BASE_SEPOLIA_MARKET = 'proto_base_sepolia_v3'

export interface AaveReserveData {
  symbol: string
  name: string
  decimals: number
  liquidityRate: string // APY for suppliers (in ray format)
  variableBorrowRate: string
  stableBorrowRate: string
  liquidityIndex: string
  utilizationRate: string
  totalLiquidity: string
  totalLiquidityUSD: string
  availableLiquidity: string
  availableLiquidityUSD: string
  totalDebt: string
  totalDebtUSD: string
  priceInUSD: string
  lastUpdateTimestamp: number
}

export interface AaveMarketData {
  reserves: AaveReserveData[]
}

class AaveAPIService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 30000 // 30 seconds

  private getCachedData(key: string) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }
    return null
  }

  private setCachedData(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  async getMarketData(): Promise<AaveMarketData> {
    const cacheKey = `market_${BASE_SEPOLIA_MARKET}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const response = await fetch(`${AAVE_API_BASE}/data/markets-data`)
      if (!response.ok) {
        throw new Error(`Aave API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Find Base Sepolia market data
      const marketData = data.find((market: any) => 
        market.marketTitle?.toLowerCase().includes('base') || 
        market.chainId === 84532
      )
      
      if (!marketData) {
        throw new Error('Base Sepolia market data not found')
      }

      this.setCachedData(cacheKey, marketData)
      return marketData
    } catch (error) {
      console.error('Failed to fetch Aave market data:', error)
      
      // Return mock data for Base Sepolia if API fails
      return this.getMockData()
    }
  }

  async getWETHReserveData(): Promise<AaveReserveData | null> {
    try {
      const marketData = await this.getMarketData()
      
      // Find WETH reserve data
      const wethReserve = marketData.reserves?.find(reserve => 
        reserve.symbol === 'WETH' || 
        reserve.symbol === 'ETH' ||
        reserve.name?.toLowerCase().includes('ethereum')
      )

      return wethReserve || null
    } catch (error) {
      console.error('Failed to fetch WETH reserve data:', error)
      return null
    }
  }

  async getWETHSupplyAPY(): Promise<number> {
    const cacheKey = 'weth_apy'
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const wethData = await this.getWETHReserveData()
      
      if (!wethData) {
        throw new Error('WETH reserve data not found')
      }

      // Convert from ray format (27 decimals) to percentage
      // liquidityRate is in ray format (1e27), convert to APY percentage
      const liquidityRateRay = BigInt(wethData.liquidityRate)
      const rayDecimals = BigInt(10 ** 27)
      
      // Convert ray to decimal percentage
      const apyDecimal = Number(liquidityRateRay) / Number(rayDecimals)
      const apyPercentage = apyDecimal * 100

      this.setCachedData(cacheKey, apyPercentage)
      return apyPercentage
    } catch (error) {
      console.error('Failed to calculate WETH APY:', error)
      
      // Return a realistic mock APY for Base Sepolia
      const mockAPY = 2.34 // ~2.34% APY
      this.setCachedData(cacheKey, mockAPY)
      return mockAPY
    }
  }

  private getMockData(): AaveMarketData {
    // Mock data for Base Sepolia when API is unavailable
    return {
      reserves: [
        {
          symbol: 'WETH',
          name: 'Wrapped Ethereum',
          decimals: 18,
          liquidityRate: '23400000000000000000000000', // ~2.34% in ray format
          variableBorrowRate: '28500000000000000000000000',
          stableBorrowRate: '35000000000000000000000000',
          liquidityIndex: '1000000000000000000000000000',
          utilizationRate: '0.45',
          totalLiquidity: '1000000000000000000000', // 1000 WETH
          totalLiquidityUSD: '2400000.00',
          availableLiquidity: '550000000000000000000', // 550 WETH
          availableLiquidityUSD: '1320000.00',
          totalDebt: '450000000000000000000', // 450 WETH
          totalDebtUSD: '1080000.00',
          priceInUSD: '2400.00',
          lastUpdateTimestamp: Date.now()
        }
      ]
    }
  }

  // Get price data (for USD conversion)
  async getWETHPriceUSD(): Promise<number> {
    const cacheKey = 'weth_price_usd'
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const wethData = await this.getWETHReserveData()
      
      if (wethData?.priceInUSD) {
        const price = parseFloat(wethData.priceInUSD)
        this.setCachedData(cacheKey, price)
        return price
      }

      // Fallback to CoinGecko API
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      const data = await response.json()
      const price = data.ethereum?.usd || 2400 // fallback price

      this.setCachedData(cacheKey, price)
      return price
    } catch (error) {
      console.error('Failed to fetch WETH price:', error)
      
      // Return reasonable fallback price
      const fallbackPrice = 2400
      this.setCachedData(cacheKey, fallbackPrice)
      return fallbackPrice
    }
  }
}

export const aaveAPI = new AaveAPIService()