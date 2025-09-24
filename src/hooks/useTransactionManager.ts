import { useState, useCallback, useEffect } from 'react'
import { useWaitForTransactionReceipt } from 'wagmi'
import { useToast } from '../components/ui/Toast'

interface TransactionState {
  isLoading: boolean
  hash?: string
  status: 'idle' | 'pending' | 'confirmed' | 'failed'
  error?: string
}

export function useTransactionManager() {
  const [txState, setTxState] = useState<TransactionState>({
    isLoading: false,
    status: 'idle'
  })
  
  const { addToast } = useToast()

  // Wait for transaction receipt when we have a hash
  const { data: receipt } = useWaitForTransactionReceipt({
    hash: txState.hash as `0x${string}` | undefined,
  })

  // Update status when receipt is received
  useEffect(() => {
    if (receipt && txState.hash) {
      if (receipt.status === 'success') {
        setTxState(prev => ({ ...prev, status: 'confirmed', isLoading: false }))
        addToast({
          type: 'success',
          title: 'Transaction Confirmed',
          message: 'Your transaction has been confirmed on the blockchain.',
          txHash: txState.hash,
          duration: 5000
        })
      } else {
        setTxState(prev => ({ ...prev, status: 'failed', isLoading: false }))
        addToast({
          type: 'error',
          title: 'Transaction Failed',
          message: 'Your transaction failed. Please try again.',
          txHash: txState.hash,
          duration: 5000
        })
      }
    }
  }, [receipt, txState.hash, addToast])

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
      addToast({
        type: 'info',
        title: 'Transaction Pending',
        message: `Your ${transactionName} transaction is being processed...`,
        txHash: result.hash,
        duration: 5000, // Don't auto-dismiss pending transactions
      })

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

  return {
    txState,
    executeTransaction,
  }
}