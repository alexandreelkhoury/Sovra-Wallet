import { useState, useEffect, useCallback } from 'react'
import { useWallets } from '@privy-io/react-auth'
import { usePublicClient } from 'wagmi'
import { formatUnits, Address } from 'viem'
import { CONTRACT_ADDRESSES } from '../config/privy'

// ERC-20 ABI for WETH balance
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
] as const

export function useWETHBalance() {
  const { wallets } = useWallets()
  const publicClient = usePublicClient()
  const [balance, setBalance] = useState<string>('0')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get the active wallet address - prioritize injected wallets (MetaMask, Rabby, etc.) over embedded
  const activeWallet = wallets.find(wallet => wallet.connectorType === 'injected') || wallets[0]
  const userAddress = activeWallet?.address

  const fetchBalance = useCallback(async () => {
    if (!userAddress || !publicClient) {
      console.log('useWETHBalance: Missing requirements', { userAddress: !!userAddress, publicClient: !!publicClient })
      return
    }

    console.log('useWETHBalance: Fetching balance', { 
      userAddress, 
      walletType: activeWallet?.walletClientType || activeWallet?.connectorType,
      chainId: publicClient.chain?.id, 
      chainName: publicClient.chain?.name,
      contractAddress: CONTRACT_ADDRESSES.WETH 
    })

    setIsLoading(true)
    setError(null)

    try {
      const balance = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.WETH,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [userAddress as Address],
      })

      // WETH has 18 decimals
      const formattedBalance = formatUnits(balance as bigint, 18)
      console.log('useWETHBalance: Successfully fetched balance', { balance: formattedBalance, rawBalance: (balance as bigint).toString() })
      setBalance(formattedBalance)
    } catch (error) {
      console.error('useWETHBalance: Failed to fetch WETH balance:', error)
      setError('Failed to fetch WETH balance')
      setBalance('0')
    } finally {
      setIsLoading(false)
    }
  }, [userAddress, publicClient, activeWallet])

  // Fetch balance when wallet connects
  useEffect(() => {
    console.log('useWETHBalance: useEffect triggered', { 
      userAddress: !!userAddress, 
      publicClient: !!publicClient,
      chainId: publicClient?.chain?.id 
    })
    if (userAddress && publicClient) {
      fetchBalance()
    }
  }, [userAddress, publicClient, fetchBalance])

  const refetch = useCallback(() => {
    fetchBalance()
  }, [fetchBalance])

  return {
    balance,
    isLoading,
    error,
    refetch,
    userAddress: userAddress as Address | undefined
  }
}