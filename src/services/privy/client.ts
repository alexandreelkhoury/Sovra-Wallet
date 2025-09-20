import { usePrivy, useWallets } from '@privy-io/react-auth'
import React from 'react'
import { createPublicClient, http, formatUnits, parseUnits, type Address, encodeFunctionData } from 'viem'
import { baseSepolia } from 'viem/chains'
import { TransactionResult, AavePosition } from '../../types/wallet'

// MetaMask types handled by existing declarations

// Base Sepolia testnet network configuration  
export const BASE_SEPOLIA_CONFIG = {
  chainId: 84532,
  chainName: 'Base Sepolia',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.base.org'],
  blockExplorerUrls: ['https://sepolia.basescan.org'],
}

// Contract addresses on Base Sepolia testnet
export const USDC_CONTRACT_BASE_SEPOLIA = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as Address // USDC on Base Sepolia testnet
export const AAVE_LENDING_POOL_BASE_SEPOLIA = '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951' as Address // Aave V3 Pool on Base Sepolia

// ERC-20 ABI for USDC operations
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
] as const

// Aave V3 Pool ABI (simplified)
export const AAVE_POOL_ABI = [
  {
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'onBehalfOf', type: 'address' },
      { name: 'referralCode', type: 'uint16' },
    ],
    name: 'supply',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'to', type: 'address' },
    ],
    name: 'withdraw',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserAccountData',
    outputs: [
      { name: 'totalCollateralBase', type: 'uint256' },
      { name: 'totalDebtBase', type: 'uint256' },
      { name: 'availableBorrowsBase', type: 'uint256' },
      { name: 'currentLiquidationThreshold', type: 'uint256' },
      { name: 'ltv', type: 'uint256' },
      { name: 'healthFactor', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'asset', type: 'address' }],
    name: 'getReserveData',
    outputs: [
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
      { name: 'isolationModeTotalDebt', type: 'uint128' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export class PrivyWalletClient {
  private wallet: any
  public publicClient: any // Made public for transaction receipt waiting
  private requestQueue: Promise<any> = Promise.resolve()
  private lastRequestTime: number = 0
  private minRequestInterval: number = 200 // 200ms between requests

  constructor(wallet: any) {
    this.wallet = wallet
    // Create public client for read operations with Base Sepolia testnet
    this.publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(import.meta.env.VITE_BASE_SEPOLIA_RPC || 'https://sepolia.base.org', {
        batch: true, // Enable request batching
        timeout: 10000
      })
    })
  }

  // Throttle requests to prevent rate limiting
  private async throttleRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue = this.requestQueue.then(async () => {
        const now = Date.now()
        const timeSinceLastRequest = now - this.lastRequestTime
        
        if (timeSinceLastRequest < this.minRequestInterval) {
          await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest))
        }
        
        this.lastRequestTime = Date.now()
        
        try {
          const result = await requestFn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }).catch(reject)
    })
  }

  async getETHBalance(address: Address): Promise<string> {
    if (!this.publicClient) throw new Error('Public client not initialized')

    return this.throttleRequest(async () => {
      try {
        const balance = await this.publicClient.getBalance({
          address: address,
        })

        // ETH has 18 decimals
        return formatUnits(balance, 18)
      } catch (error) {
        console.error('Failed to get ETH balance:', error)
        if ((error as any).message?.includes('429') || (error as any).message?.includes('rate limit')) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.')
        }
        throw new Error('Failed to fetch ETH balance')
      }
    })
  }

  async getUSDCBalance(address: Address): Promise<string> {
    if (!this.publicClient) throw new Error('Public client not initialized')

    return this.throttleRequest(async () => {
      try {
        const balance = await this.publicClient.readContract({
          address: USDC_CONTRACT_BASE_SEPOLIA,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [address],
        })

        // USDC has 6 decimals
        return formatUnits(balance as bigint, 6)
      } catch (error) {
        console.error('Failed to get USDC balance:', error)
        if ((error as any).message?.includes('429') || (error as any).message?.includes('rate limit')) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.')
        }
        throw new Error('Failed to fetch USDC balance')
      }
    })
  }

  // This method now just prepares transaction data - actual sending happens in hooks
  prepareSupplyTransactions(amount: string, userAddress: Address) {
    const amountWei = parseUnits(amount, 6)
    
    return {
      approve: {
        to: USDC_CONTRACT_BASE_SEPOLIA,
        data: encodeFunctionData({
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [AAVE_LENDING_POOL_BASE_SEPOLIA, amountWei]
        }),
        gas: BigInt(50000), // Fixed gas limit for ERC20 approve
      },
      supply: {
        to: AAVE_LENDING_POOL_BASE_SEPOLIA,
        data: encodeFunctionData({
          abi: AAVE_POOL_ABI,
          functionName: 'supply',
          args: [USDC_CONTRACT_BASE_SEPOLIA, amountWei, userAddress, 0]
        }),
        gas: BigInt(300000), // Fixed gas limit for Aave supply
      },
      amountWei
    }
  }

  // Alternative: Prepare batched transactions for smart wallets (1 transaction instead of 2)
  prepareBatchedSupplyTransaction(amount: string, userAddress: Address) {
    const amountWei = parseUnits(amount, 6)
    
    return {
      calls: [
        {
          to: USDC_CONTRACT_BASE_SEPOLIA,
          data: encodeFunctionData({
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [AAVE_LENDING_POOL_BASE_SEPOLIA, amountWei]
          }),
        },
        {
          to: AAVE_LENDING_POOL_BASE_SEPOLIA,
          data: encodeFunctionData({
            abi: AAVE_POOL_ABI,
            functionName: 'supply',
            args: [USDC_CONTRACT_BASE_SEPOLIA, amountWei, userAddress, 0]
          }),
        }
      ],
      gas: BigInt(400000), // Total gas for both operations
      amountWei
    }
  }

  // Prepare withdraw transaction data
  prepareWithdrawTransaction(userAddress: Address) {
    return {
      to: AAVE_LENDING_POOL_BASE_SEPOLIA,
      data: encodeFunctionData({
        abi: AAVE_POOL_ABI,
        functionName: 'withdraw',
        args: [USDC_CONTRACT_BASE_SEPOLIA, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'), userAddress]
      }),
      gas: BigInt(200000), // Fixed gas limit for Aave withdraw
    }
  }

  // Encoding methods replaced with Viem's encodeFunctionData for better type safety and gas estimation

  async withdrawFromAave(userAddress: Address): Promise<TransactionResult> {
    if (!this.wallet) {
      throw new Error('Wallet not connected')
    }

    try {
      // Get user's current position to determine withdrawal amount
      const position = await this.getAavePosition(userAddress)
      
      if (parseFloat(position.supplied) === 0) {
        throw new Error('No USDC supplied to withdraw')
      }

      console.log(`Withdrawing all USDC from Aave: ${position.supplied} USDC`)

      // Use max uint256 to withdraw all available balance
      const maxAmount = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      
      const withdrawHash = await this.wallet.sendTransaction({
        to: AAVE_LENDING_POOL_BASE_SEPOLIA,
        data: encodeFunctionData({
          abi: AAVE_POOL_ABI,
          functionName: 'withdraw',
          args: [USDC_CONTRACT_BASE_SEPOLIA, BigInt(maxAmount), userAddress]
        }),
      })

      console.log('Aave withdraw transaction:', withdrawHash)

      return {
        hash: withdrawHash,
        status: 'pending',
        amount: position.supplied,
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error('Failed to withdraw from Aave:', error)
      throw new Error('Failed to withdraw from Aave')
    }
  }

  // encodeAaveWithdraw replaced with Viem's encodeFunctionData

  async getAavePosition(address: Address): Promise<AavePosition> {
    if (!this.publicClient) throw new Error('Public client not initialized')

    return this.throttleRequest(async () => {
      try {
        // Fetch user account data and USDC reserve data in parallel
        const [accountData, reserveData] = await Promise.all([
          this.publicClient.readContract({
            address: AAVE_LENDING_POOL_BASE_SEPOLIA,
            abi: AAVE_POOL_ABI,
            functionName: 'getUserAccountData',
            args: [address],
          }),
          this.publicClient.readContract({
            address: AAVE_LENDING_POOL_BASE_SEPOLIA,
            abi: AAVE_POOL_ABI,
            functionName: 'getReserveData',
            args: [USDC_CONTRACT_BASE_SEPOLIA],
          })
        ])

        const [totalCollateralBase, , , , , healthFactor] = accountData as [bigint, bigint, bigint, bigint, bigint, bigint]
        
        // Extract liquidity rate from reserve data (3rd element is currentLiquidityRate)
        const currentLiquidityRate = (reserveData as any[])[2] as bigint
        
        // Convert Aave rate to APY percentage
        // Aave rates are in ray units (1e27), and represent per-second rates
        const SECONDS_PER_YEAR = 31536000n // 365 * 24 * 60 * 60
        const RAY = 10n ** 27n
        
        // Convert to APY: ((1 + ratePerSecond)^secondsPerYear - 1) * 100
        // For simplicity, we'll use the approximation: rate * secondsPerYear * 100 / RAY
        const apyDecimal = (currentLiquidityRate * SECONDS_PER_YEAR * 100n) / RAY
        const apy = parseFloat(formatUnits(apyDecimal, 18)).toFixed(2)

        // Health factor of 0 means no debt, so we show a safe high value
        let formattedHealthFactor = '∞' // Infinity symbol for no debt
        if (healthFactor > 0n && healthFactor < BigInt('1000000000000000000000')) { // Less than 1000 * 10^18
          formattedHealthFactor = parseFloat(formatUnits(healthFactor, 18)).toFixed(2)
        }

        return {
          supplied: formatUnits(totalCollateralBase, 8), // Aave uses 8 decimals for USD values
          apy: apy, // Real APY from Aave contract
          healthFactor: formattedHealthFactor,
        }
      } catch (error) {
        console.error('Failed to get Aave position:', error)
        if ((error as any).message?.includes('429') || (error as any).message?.includes('rate limit')) {
          console.warn('Rate limit hit for Aave position, returning default values')
        }
        // Return empty position if error
        return {
          supplied: '0.00',
          apy: '0.00', // No mock data - show 0 if we can't fetch real data
          healthFactor: '0.00',
        }
      }
    })
  }

  async getTransactionStatus(hash: string): Promise<'pending' | 'confirmed' | 'failed'> {
    if (!this.publicClient) throw new Error('Public client not initialized')

    return this.throttleRequest(async () => {
      try {
        const receipt = await this.publicClient.getTransactionReceipt({ hash })
        return receipt.status === 'success' ? 'confirmed' : 'failed'
      } catch (error) {
        // Transaction might still be pending
        return 'pending'
      }
    })
  }

  async executeSwap(params: { to: Address; value: bigint; data: string }): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not connected')
    }

    try {
      const hash = await this.wallet.sendTransaction({
        to: params.to,
        value: params.value,
        data: params.data,
      })

      console.log('Swap transaction sent:', hash)
      return hash
    } catch (error) {
      console.error('Failed to execute swap:', error)
      throw new Error('Swap execution failed')
    }
  }

  async approveToken(tokenAddress: Address, spender: Address, amount: bigint): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not connected')
    }

    try {
      const approveData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender, amount]
      })
      
      const hash = await this.wallet.sendTransaction({
        to: tokenAddress,
        data: approveData,
      })

      console.log('Token approval transaction:', hash)
      return hash
    } catch (error) {
      console.error('Failed to approve token:', error)
      throw new Error('Token approval failed')
    }
  }
}

// Hook to use the Privy wallet client with proper initialization
export function usePrivyWalletClient() {
  const { ready, authenticated, user } = usePrivy()
  const { wallets } = useWallets()

  // Log wallet changes for debugging
  React.useEffect(() => {
    if (wallets.length > 0) {
      console.log('Wallets updated:', wallets.length)
    }
  }, [wallets])

  // Prefer external wallets (MetaMask, Rabby, etc.) over embedded wallets
  // First try any injected wallet
  const injectedWallet = wallets.find(w => w.connectorType === 'injected')
  // Then try MetaMask specifically
  const metamaskWallet = wallets.find(w => w.walletClientType === 'metamask')
  // Prefer Base Sepolia wallets (correct network for our app)
  const baseSepoliaWallet = wallets.find(w => w.chainId === 'eip155:84532')
  
  // Priority: Injected first, then MetaMask, then Base Sepolia wallets, then fallback
  const wallet = injectedWallet || metamaskWallet || baseSepoliaWallet || wallets[0]

  console.log('usePrivyWalletClient debug - ALL WALLETS:', {
    ready,
    authenticated, 
    user: !!user,
    userWallet: !!user?.wallet,
    userWalletAddress: user?.wallet?.address,
    walletsCount: wallets.length,
    allWallets: wallets.map(w => ({ 
      type: w.walletClientType, 
      address: w.address,
      imported: w.imported,
      chainId: w.chainId,
      connectorType: w.connectorType 
    })),
    selectedWallet: wallet ? {
      type: wallet.walletClientType,
      address: wallet.address,
      imported: wallet.imported,
      chainId: wallet.chainId,
      connectorType: wallet.connectorType
    } : null
  })

  let client = null
  let isReady = false
  let address: Address | undefined = undefined

  if (ready && authenticated && wallet) {
    client = new PrivyWalletClient(wallet)
    isReady = true
    // Use the connected wallet's address, not the embedded wallet address
    address = wallet.address as Address
  }

  return {
    client,
    isReady,
    address,
  }
}