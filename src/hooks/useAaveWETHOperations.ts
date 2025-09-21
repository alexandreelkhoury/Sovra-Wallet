import { useState } from 'react'
import { useWallets } from '@privy-io/react-auth'
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets'
import { usePublicClient } from 'wagmi'
import { parseUnits, encodeFunctionData, Address, formatUnits } from 'viem'
import { CONTRACT_ADDRESSES } from '../config/privy'
import { useTransactionManager } from './useTransactionManager'

// ERC-20 ABI for approve
const ERC20_ABI = [
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
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
] as const

// Aave V3 Pool ABI
const AAVE_POOL_ABI = [
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
] as const

export function useAaveWETHOperations(onBalanceUpdate?: () => void) {
  const { wallets } = useWallets()
  const { client: smartWalletClient } = useSmartWallets()
  const publicClient = usePublicClient()
  const { executeTransaction } = useTransactionManager()
  const [isSupplying, setIsSupplying] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get the active wallet address - prioritize injected wallets (MetaMask, Rabby, etc.) over embedded
  const activeWallet = wallets.find(wallet => wallet.connectorType === 'injected') || wallets[0]
  const userAddress = activeWallet?.address as Address

  // Get user's supplied WETH balance from aWETH token
  const getSuppliedBalance = async (): Promise<string> => {
    if (!userAddress || !publicClient) return '0'

    try {
      const balance = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.A_WETH,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [userAddress],
      })

      // aWETH has 18 decimals like WETH
      return formatUnits(balance as bigint, 18)
    } catch (error) {
      console.error('Failed to get supplied WETH balance:', error)
      return '0'
    }
  }

  const supplyWETH = async (amount: string) => {
    if (!userAddress || !amount || parseFloat(amount) <= 0 || !activeWallet) {
      setError('Invalid amount or wallet not connected')
      return
    }

    setIsSupplying(true)
    setError(null)

    try {
      const amountWei = parseUnits(amount, 18) // WETH has 18 decimals

      console.log('Using wallet for Aave WETH operations:', {
        address: activeWallet.address,
        type: activeWallet.walletClientType,
        connectorType: activeWallet.connectorType
      })

      // Step 1: Approve WETH to Aave Pool
      console.log('Approving WETH with smart wallet (gasless)...')
      const approveData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.AAVE_POOL, amountWei]
      })

      const approveTxHash = await executeTransaction(
        async () => {
          if (!smartWalletClient) {
            throw new Error('Smart wallet client not available')
          }
          const hash = await smartWalletClient.sendTransaction({
            to: CONTRACT_ADDRESSES.WETH,
            data: approveData,
          })
          return { hash }
        },
        'WETH approval (gasless)'
      )

      console.log('Approval transaction:', approveTxHash)

      // Wait a bit for the approval to be confirmed
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Step 2: Supply WETH to Aave
      console.log('Supplying WETH to Aave with smart wallet (gasless)...')
      const supplyData = encodeFunctionData({
        abi: AAVE_POOL_ABI,
        functionName: 'supply',
        args: [CONTRACT_ADDRESSES.WETH, amountWei, userAddress, 0]
      })

      const supplyTxHash = await executeTransaction(
        async () => {
          if (!smartWalletClient) {
            throw new Error('Smart wallet client not available')
          }
          const hash = await smartWalletClient.sendTransaction({
            to: CONTRACT_ADDRESSES.AAVE_POOL,
            data: supplyData,
          })
          return { hash }
        },
        'WETH supply to Aave (gasless)'
      )

      console.log('Supply transaction:', supplyTxHash)
      
      // Refresh wallet WETH balance after successful supply
      if (onBalanceUpdate) {
        // Wait a bit for transaction to be mined before refreshing
        setTimeout(onBalanceUpdate, 5000)
      }
      
      return supplyTxHash

    } catch (error) {
      console.error('Supply failed:', error)
      setError(error instanceof Error ? error.message : 'Supply failed')
    } finally {
      setIsSupplying(false)
    }
  }

  const withdrawWETH = async (amount?: string) => {
    if (!userAddress || !activeWallet) {
      setError('Wallet not connected')
      return
    }

    setIsWithdrawing(true)
    setError(null)

    try {
      let withdrawAmount: bigint
      
      if (amount && parseFloat(amount) > 0) {
        // Withdraw specific amount
        withdrawAmount = parseUnits(amount, 18) // WETH has 18 decimals
        console.log('Withdrawing', amount, 'WETH from Aave...')
      } else {
        // Withdraw all - use max uint256
        withdrawAmount = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
        console.log('Withdrawing all WETH from Aave...')
      }
      
      console.log('Using wallet for withdraw:', {
        address: activeWallet.address,
        type: activeWallet.walletClientType,
        connectorType: activeWallet.connectorType
      })
      
      const withdrawData = encodeFunctionData({
        abi: AAVE_POOL_ABI,
        functionName: 'withdraw',
        args: [CONTRACT_ADDRESSES.WETH, withdrawAmount, userAddress]
      })

      const withdrawTxHash = await executeTransaction(
        async () => {
          if (!smartWalletClient) {
            throw new Error('Smart wallet client not available')
          }
          const hash = await smartWalletClient.sendTransaction({
            to: CONTRACT_ADDRESSES.AAVE_POOL,
            data: withdrawData,
          })
          return { hash }
        },
        'WETH withdrawal from Aave (gasless)'
      )

      console.log('Withdraw transaction:', withdrawTxHash)
      
      // Refresh wallet WETH balance after successful withdraw
      if (onBalanceUpdate) {
        // Wait a bit for transaction to be mined before refreshing
        setTimeout(onBalanceUpdate, 5000)
      }
      
      return withdrawTxHash

    } catch (error) {
      console.error('Withdraw failed:', error)
      setError(error instanceof Error ? error.message : 'Withdraw failed')
    } finally {
      setIsWithdrawing(false)
    }
  }

  return {
    supplyWETH,
    withdrawWETH,
    withdrawAllWETH: () => withdrawWETH(), // Keep backwards compatibility
    getSuppliedBalance,
    isSupplying,
    isWithdrawing,
    error,
    userAddress
  }
}