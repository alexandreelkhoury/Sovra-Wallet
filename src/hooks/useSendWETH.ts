import { useState } from 'react'
import { useWallets } from '@privy-io/react-auth'
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets'
import { parseUnits, encodeFunctionData, Address, isAddress } from 'viem'
import { CONTRACT_ADDRESSES } from '../config/privy'
import { useTransactionManager } from './useTransactionManager'

// ERC-20 ABI for transfer
const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
] as const

export function useSendWETH(onBalanceUpdate?: () => void) {
  const { wallets } = useWallets()
  const { client: smartWalletClient } = useSmartWallets()
  const { executeTransaction } = useTransactionManager()
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get the active wallet address - prioritize injected wallets (MetaMask, Rabby, etc.) over embedded
  const activeWallet = wallets.find(wallet => wallet.connectorType === 'injected') || wallets[0]
  const userAddress = activeWallet?.address as Address

  const sendWETH = async (recipientAddress: string, amount: string) => {
    if (!userAddress || !amount || parseFloat(amount) <= 0 || !activeWallet) {
      setError('Invalid amount or wallet not connected')
      return
    }

    // Validate recipient address
    if (!recipientAddress || !isAddress(recipientAddress)) {
      setError('Invalid recipient address')
      return
    }

    // Check if trying to send to self
    if (recipientAddress.toLowerCase() === userAddress.toLowerCase()) {
      setError('Cannot send to your own address')
      return
    }

    setIsSending(true)
    setError(null)

    try {
      const amountWei = parseUnits(amount, 18) // WETH has 18 decimals

      console.log('Sending WETH:', {
        from: userAddress,
        to: recipientAddress,
        amount: amount,
        amountWei: amountWei.toString(),
        wallet: {
          address: activeWallet.address,
          type: activeWallet.walletClientType,
          connectorType: activeWallet.connectorType
        }
      })

      // Encode transfer function data
      const transferData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [recipientAddress as Address, amountWei]
      })

      // Execute the transfer transaction with smart wallet (gasless)
      const txHash = await executeTransaction(
        async () => {
          if (!smartWalletClient) {
            throw new Error('Smart wallet client not available')
          }
          const hash = await smartWalletClient.sendTransaction({
            to: CONTRACT_ADDRESSES.WETH,
            data: transferData,
          })
          return { hash }
        },
        `WETH transfer to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)} (gasless)`
      )

      console.log('Transfer transaction hash:', txHash)
      
      // Refresh wallet WETH balance after successful transfer
      if (onBalanceUpdate) {
        // Wait a bit for transaction to be mined before refreshing
        setTimeout(onBalanceUpdate, 5000)
      }
      
      return txHash

    } catch (error) {
      console.error('WETH transfer failed:', error)
      setError(error instanceof Error ? error.message : 'Transfer failed')
      throw error
    } finally {
      setIsSending(false)
    }
  }

  return {
    sendWETH,
    isSending,
    error,
    userAddress
  }
}