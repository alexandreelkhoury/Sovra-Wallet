import { useState, useCallback, useEffect } from 'react'
import { usePublicClient, useWaitForTransactionReceipt } from 'wagmi'
import { formatUnits } from 'viem'
import { useToast } from '../components/ui/Toast'

export interface TransactionState {
  isLoading: boolean
  hash?: string
  status: 'idle' | 'estimating' | 'pending' | 'confirmed' | 'failed'
  gasEstimate?: string
  error?: string
}

export interface EstimateGasParams {
  to: string
  data: string
  value?: bigint
  from: string
}

export function useTransactionManager() {
  const [txState, setTxState] = useState<TransactionState>({
    isLoading: false,
    status: 'idle'
  })
  
  const publicClient = usePublicClient()
  const { addToast, updateToast } = useToast()

  // Wait for transaction receipt when we have a hash
  const { data: receipt } = useWaitForTransactionReceipt({
    hash: txState.hash as `0x${string}` | undefined,
  })

  // Update status when receipt is received
  useEffect(() => {
    if (receipt && txState.hash) {
      if (receipt.status === 'success') {
        setTxState(prev => ({ ...prev, status: 'confirmed', isLoading: false }))
        updateToast(txState.hash, {
          type: 'success',
          title: 'Transaction Confirmed',
          message: 'Your transaction has been confirmed on the blockchain.',
          duration: 5000
        })
      } else {
        setTxState(prev => ({ ...prev, status: 'failed', isLoading: false }))
        updateToast(txState.hash, {
          type: 'error',
          title: 'Transaction Failed',
          message: 'Your transaction failed. Please try again.',
          duration: 5000
        })
      }
    }
  }, [receipt, txState.hash, updateToast])

  const estimateGas = useCallback(async (params: EstimateGasParams): Promise<string> => {
    if (!publicClient) throw new Error('Public client not available')

    setTxState(prev => ({ ...prev, status: 'estimating' }))

    try {
      const gasEstimate = await publicClient.estimateGas({
        to: params.to as `0x${string}`,
        data: params.data as `0x${string}`,
        value: params.value,
        account: params.from as `0x${string}`,
      })

      // Get current gas price
      const gasPrice = await publicClient.getGasPrice()
      const estimatedCost = gasEstimate * gasPrice
      const estimatedCostInEth = formatUnits(estimatedCost, 18)

      setTxState(prev => ({ 
        ...prev, 
        gasEstimate: estimatedCostInEth,
        status: 'idle'
      }))

      return estimatedCostInEth
    } catch (error) {
      console.error('Gas estimation failed:', error)
      setTxState(prev => ({ 
        ...prev, 
        error: 'Failed to estimate gas',
        status: 'idle'
      }))
      throw error
    }
  }, [publicClient])

  const executeTransaction = useCallback(async (
    sendTransaction: () => Promise<{ hash: string }>,
    transactionName: string
  ) => {
    setTxState(prev => ({ ...prev, isLoading: true, status: 'pending' }))

    try {
      const result = await sendTransaction()
      
      setTxState(prev => ({ 
        ...prev, 
        hash: result.hash,
        status: 'pending'
      }))

      // Add pending toast notification
      const toastId = addToast({
        type: 'info',
        title: 'Transaction Pending',
        message: `Your ${transactionName} transaction is being processed...`,
        txHash: result.hash,
        duration: 0, // Don't auto-dismiss pending transactions
      })

      // Store toast ID for later updates
      setTxState(prev => ({ ...prev, hash: toastId }))

      return result.hash
    } catch (error: any) {
      console.error('Transaction failed:', error)
      
      let errorMessage = 'Transaction failed. Please try again.'
      
      // Parse common error types
      if (error.message) {
        if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds to complete this transaction.'
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was cancelled by user.'
        } else if (error.message.includes('gas too low')) {
          errorMessage = 'Gas limit too low. Please try again with higher gas.'
        } else if (error.message.includes('nonce too low')) {
          errorMessage = 'Transaction nonce error. Please refresh and try again.'
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        }
      }

      setTxState(prev => ({ 
        ...prev, 
        isLoading: false, 
        status: 'failed',
        error: errorMessage
      }))

      addToast({
        type: 'error',
        title: 'Transaction Failed',
        message: errorMessage,
        duration: 8000,
      })

      throw error
    }
  }, [addToast])

  const reset = useCallback(() => {
    setTxState({
      isLoading: false,
      status: 'idle'
    })
  }, [])

  return {
    txState,
    estimateGas,
    executeTransaction,
    reset,
  }
}