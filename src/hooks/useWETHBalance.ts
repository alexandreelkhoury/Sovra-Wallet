import { useReadContract } from 'wagmi'
import { formatUnits, Address } from 'viem'
import { CONTRACT_ADDRESSES } from '../config/privy'
import { useWallet } from '../context/SimpleWalletProvider'

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
  const { walletState } = useWallet()
  const userAddress = walletState.address

  const { 
    data: rawBalance, 
    isLoading, 
    error, 
    refetch 
  } = useReadContract({
    address: CONTRACT_ADDRESSES.WETH,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress as Address] : undefined,
    query: {
      enabled: !!userAddress,
      staleTime: 30_000, // Cache for 30 seconds
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
    }
  })

  // Format the balance from Wei to readable format
  const balance = rawBalance ? formatUnits(rawBalance as bigint, 18) : '0'

  return {
    balance,
    isLoading,
    error: error?.message || null,
    refetch,
    userAddress: userAddress as Address | undefined
  }
}