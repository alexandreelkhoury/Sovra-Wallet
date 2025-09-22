import React, { useState } from 'react'
import { useWETHBalanceContext } from '../../context/WETHBalanceContext'
import { useSendWETH } from '../../hooks/useSendWETH'
import { useToast } from '../ui/Toast'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { ExpandableCard } from '../ui/ExpandableCard'

export const SendWETH: React.FC = () => {
  const [recipientAddress, setRecipientAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  
  const { balance, refetch } = useWETHBalanceContext()
  const { sendWETH, isSending, error } = useSendWETH(refetch)
  const { addToast } = useToast()

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value)
    }
  }

  const handleMaxClick = () => {
    setAmount(balance)
  }

  const handleSend = async () => {
    if (!recipientAddress || !amount) {
      addToast({ type: 'error', title: 'Please fill in all fields' })
      return
    }

    if (parseFloat(amount) <= 0) {
      addToast({ type: 'error', title: 'Amount must be greater than 0' })
      return
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      addToast({ type: 'error', title: 'Insufficient WETH balance' })
      return
    }

    setShowConfirmation(true)
  }

  const handleConfirmSend = async () => {
    try {
      const txHash = await sendWETH(recipientAddress, amount)
      
      if (txHash) {
        addToast({
          type: 'success',
          title: 'WETH sent successfully!',
          message: `Transaction: ${txHash.slice(0, 10)}...`,
          txHash
        })
        
        // Reset form
        setRecipientAddress('')
        setAmount('')
        setShowConfirmation(false)
      }
    } catch (error) {
      console.error('Send failed:', error)
      addToast({ type: 'error', title: 'Transaction failed. Please try again.' })
    }
  }

  const handleCancelSend = () => {
    setShowConfirmation(false)
  }

  const sendIcon = (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  )

  return (
    <ExpandableCard
      title="Send WETH"
      icon={sendIcon}
      iconColor="bg-blue-500"
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
    >

      <div className="space-y-4">
        {/* Available Balance */}
        <div className="bg-slate-700 rounded-xl p-3 sm:p-4 border border-slate-600">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-300">Available Balance</span>
            <span className="font-semibold text-white">
              {parseFloat(balance).toFixed(6)} WETH
            </span>
          </div>
        </div>

        {/* Recipient Address */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="0x742d35cc6639ba532dc88d4b5b59e8f8e9c8b8c6"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm placeholder-slate-400"
            disabled={isSending}
          />
          <p className="text-xs text-slate-400">
            Enter the recipient's wallet address on Base Sepolia
          </p>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Amount (WETH)
          </label>
          <div className="relative">
            <input
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 pr-16 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400"
              disabled={isSending}
            />
            <button
              type="button"
              onClick={handleMaxClick}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              disabled={isSending}
            >
              MAX
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.598 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        )}


        {/* Send Button */}
        {!showConfirmation ? (
          <button
            onClick={handleSend}
            disabled={isSending || !recipientAddress || !amount || parseFloat(amount) <= 0}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <span className="flex items-center justify-center">
                <LoadingSpinner size="md" color="white" className="-ml-1 mr-3" />
                Sending...
              </span>
            ) : (
              'Review Transaction'
            )}
          </button>
        ) : (
          /* Confirmation Screen */
          <div className="space-y-4">
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
              <h3 className="font-medium text-yellow-300 mb-2">Confirm Transaction</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">To:</span>
                  <span className="font-mono text-white">
                    {recipientAddress.slice(0, 10)}...{recipientAddress.slice(-8)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount:</span>
                  <span className="font-semibold text-white">{amount} WETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Network:</span>
                  <span className="text-white">Base Sepolia</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gas Fee:</span>
                  <span className="text-green-400 font-medium">⚡ Sponsored (Free)</span>
                </div>
              </div>
              <p className="text-xs text-yellow-300 mt-3">
                ⚠️ This transaction cannot be reversed. Please verify the recipient address.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCancelSend}
                disabled={isSending}
                className="flex-1 bg-slate-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSend}
                disabled={isSending}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {isSending ? (
                  <span className="flex items-center justify-center">
                    <LoadingSpinner size="md" color="white" className="-ml-1 mr-3" />
                    Sending...
                  </span>
                ) : (
                  'Confirm Send'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </ExpandableCard>
  )
}