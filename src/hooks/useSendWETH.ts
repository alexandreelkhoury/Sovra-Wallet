import { useState } from 'react'
import { parseUnits, encodeFunctionData, Address, isAddress } from 'viem'
import { CONTRACT_ADDRESSES } from '../config/privy'
import { useTransactionManager } from './useTransactionManager'
import { useWallet } from '../context/SimpleWalletContext'
import { useTransactionSender } from '../utils/transactionUtils'

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
  const { executeTransaction } = useTransactionManager()
  const { walletMode, walletState } = useWallet()
  const { sendTransactionByMode, useSmartWallet, activeWallet } = useTransactionSender()
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use the active wallet address from context (switches based on wallet mode)
  const userAddress = walletState.address as Address

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
        walletMode,
        useSmartWallet,
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

      // Execute the transfer transaction based on wallet mode
      const txHash = await executeTransaction(
        async () => {
          return await sendTransactionByMode({
            to: CONTRACT_ADDRESSES.WETH,
            data: transferData,
          })
        },
        `WETH transfer to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)} (${useSmartWallet ? 'smart wallet' : 'normal wallet'})`
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