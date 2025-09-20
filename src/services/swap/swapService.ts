import { PrivyWalletClient } from '../privy/client'
import { SwapQuote, SwapResult, SwapSettings, BASE_SEPOLIA_TOKENS, SWAP_ROUTERS, POOL_FEES } from '../../types/swap'
import { Address, parseUnits, parseEther } from 'viem'

export class SwapService {
  private client: PrivyWalletClient
  private routerAddress: Address

  constructor(client: PrivyWalletClient) {
    this.client = client
    this.routerAddress = SWAP_ROUTERS.UNISWAP_V3_ROUTER as Address
  }

  async swapETHToUSDT(
    ethAmount: string, 
    minUSDTOut: string, 
    userAddress: Address,
    settings: SwapSettings = { slippageTolerance: 0.5, deadline: 20 }
  ): Promise<SwapResult> {
    try {
      const amountIn = parseEther(ethAmount)
      const amountOutMinimum = parseUnits(minUSDTOut, 6) // USDT has 6 decimals
      const deadline = Math.floor(Date.now() / 1000) + (settings.deadline * 60)

      // Prepare swap parameters for exactInputSingle
      const swapParams = {
        tokenIn: BASE_SEPOLIA_TOKENS.WETH,
        tokenOut: BASE_SEPOLIA_TOKENS.USDT,
        fee: POOL_FEES.MEDIUM, // 0.3% fee tier
        recipient: userAddress,
        deadline: deadline,
        amountIn: amountIn,
        amountOutMinimum: amountOutMinimum,
        sqrtPriceLimitX96: 0n // No price limit
      }

      console.log('Swapping ETH to USDT with params:', swapParams)

      // Execute swap through router
      const swapData = this.encodeExactInputSingle(swapParams)
      
      const hash = await this.client.executeSwap({
        to: this.routerAddress,
        value: amountIn, // Send ETH with transaction
        data: swapData
      })

      return {
        hash,
        status: 'pending',
        amountIn: ethAmount,
        amountOut: minUSDTOut,
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('Failed to swap ETH to USDT:', error)
      throw new Error('Swap failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  async swapUSDTToETH(
    usdtAmount: string, 
    minETHOut: string, 
    userAddress: Address,
    settings: SwapSettings = { slippageTolerance: 0.5, deadline: 20 }
  ): Promise<SwapResult> {
    try {
      const amountIn = parseUnits(usdtAmount, 6) // USDT has 6 decimals
      const amountOutMinimum = parseEther(minETHOut)
      const deadline = Math.floor(Date.now() / 1000) + (settings.deadline * 60)

      // First approve USDT spending by router
      console.log('Approving USDT spending...')
      const approveHash = await this.client.approveToken(
        BASE_SEPOLIA_TOKENS.USDT,
        this.routerAddress,
        amountIn
      )

      console.log('USDT approval transaction:', approveHash)

      // Wait for approval (in production, should wait for confirmation)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Prepare swap parameters
      const swapParams = {
        tokenIn: BASE_SEPOLIA_TOKENS.USDT,
        tokenOut: BASE_SEPOLIA_TOKENS.WETH,
        fee: POOL_FEES.MEDIUM,
        recipient: userAddress,
        deadline: deadline,
        amountIn: amountIn,
        amountOutMinimum: amountOutMinimum,
        sqrtPriceLimitX96: 0n
      }

      console.log('Swapping USDT to ETH with params:', swapParams)

      // Execute swap
      const swapData = this.encodeExactInputSingle(swapParams)
      
      const hash = await this.client.executeSwap({
        to: this.routerAddress,
        value: 0n, // No ETH needed for ERC20 to ETH swap
        data: swapData
      })

      return {
        hash,
        status: 'pending',
        amountIn: usdtAmount,
        amountOut: minETHOut,
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('Failed to swap USDT to ETH:', error)
      throw new Error('Swap failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  async getSwapQuote(
    tokenIn: Address, 
    tokenOut: Address, 
    amountIn: string,
    _tokenInDecimals: number = 18
  ): Promise<SwapQuote> {
    try {
      // This is a simplified quote - in production you'd use Quoter contract
      // For now, we'll return a mock quote based on rough market rates
      
      const isETHToUSDT = tokenIn.toLowerCase() === BASE_SEPOLIA_TOKENS.WETH.toLowerCase()
      const mockETHPrice = 2000 // $2000 per ETH
      
      let amountOut: string
      let priceImpact = '0.1' // 0.1% price impact (mock)
      
      if (isETHToUSDT) {
        // ETH to USDT
        const ethAmount = parseFloat(amountIn)
        const usdtAmount = ethAmount * mockETHPrice * 0.997 // 0.3% fee
        amountOut = usdtAmount.toFixed(6)
      } else {
        // USDT to ETH  
        const usdtAmount = parseFloat(amountIn)
        const ethAmount = (usdtAmount / mockETHPrice) * 0.997 // 0.3% fee
        amountOut = ethAmount.toFixed(18)
      }

      const slippage = 0.5 // 0.5% slippage
      const minAmountOut = (parseFloat(amountOut) * (1 - slippage / 100)).toString()

      return {
        amountOut,
        priceImpact,
        minimumAmountOut: minAmountOut,
        route: [tokenIn, tokenOut],
        fee: POOL_FEES.MEDIUM,
        gasEstimate: '150000' // Estimated gas
      }
    } catch (error) {
      console.error('Failed to get swap quote:', error)
      throw new Error('Quote failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  private encodeExactInputSingle(params: any): string {
    // Uniswap V3 SwapRouter02 exactInputSingle function selector
    const functionSelector = '0x04e45aaf'
    
    // Encode parameters (simplified - in production use proper ABI encoding)
    // This is a basic implementation - you may need to use proper ABI encoding libraries
    
    const tokenIn = params.tokenIn.slice(2).padStart(64, '0')
    const tokenOut = params.tokenOut.slice(2).padStart(64, '0')
    const fee = params.fee.toString(16).padStart(64, '0')
    const recipient = params.recipient.slice(2).padStart(64, '0')
    const deadline = params.deadline.toString(16).padStart(64, '0')
    const amountIn = params.amountIn.toString(16).padStart(64, '0')
    const amountOutMinimum = params.amountOutMinimum.toString(16).padStart(64, '0')
    const sqrtPriceLimitX96 = params.sqrtPriceLimitX96.toString(16).padStart(64, '0')

    return functionSelector + 
           tokenIn + 
           tokenOut + 
           fee + 
           recipient + 
           deadline + 
           amountIn + 
           amountOutMinimum + 
           sqrtPriceLimitX96
  }
}