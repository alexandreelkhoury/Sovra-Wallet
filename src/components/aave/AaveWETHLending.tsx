import React, { useState, useEffect } from 'react'
import { useAaveWETHOperations } from '../../hooks/useAaveWETHOperations'
import { useWETHBalanceContext } from '../../context/WETHBalanceContext'
import { useAaveAPY } from '../../hooks/useAaveAPY'
import { useWallet } from '../../context/SimpleWalletContext'
import { LoadingSpinner } from '../ui/LoadingSpinner'

export const AaveWETHLending: React.FC = () => {
  const { balance: walletBalance, refetch: refetchWalletBalance } = useWETHBalanceContext()
  const { supplyWETH, withdrawWETH, getSuppliedBalance, isSupplying, isWithdrawing, error } = useAaveWETHOperations(refetchWalletBalance)
  const { apy, formatAPY, isLoading: isAPYLoading } = useAaveAPY()
  const { walletMode, useSmartWallet } = useWallet()
  const [amount, setAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [suppliedBalance, setSuppliedBalance] = useState('0')
  const [isLoadingSupplied, setIsLoadingSupplied] = useState(false)

  // Fetch supplied balance
  const fetchSuppliedBalance = async () => {
    setIsLoadingSupplied(true)
    try {
      const balance = await getSuppliedBalance()
      setSuppliedBalance(balance)
    } catch (error) {
      console.error('Failed to fetch supplied balance:', error)
    } finally {
      setIsLoadingSupplied(false)
    }
  }

  useEffect(() => {
    fetchSuppliedBalance()
  }, [walletMode, useSmartWallet, getSuppliedBalance]) // Refetch when wallet mode changes

  const handleSupply = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    
    try {
      await supplyWETH(amount)
      setAmount('')
      // Refresh balances after transaction
      setTimeout(() => {
        fetchSuppliedBalance()
      }, 3000)
    } catch (error) {
      console.error('Supply failed:', error)
    }
  }

  const handleWithdraw = async () => {
    try {
      await withdrawWETH(withdrawAmount || undefined) // Pass undefined for withdraw all
      setWithdrawAmount('')
      // Refresh balances after transaction
      setTimeout(() => {
        fetchSuppliedBalance()
      }, 3000)
    } catch (error) {
      console.error('Withdraw failed:', error)
    }
  }

  const handleWithdrawMaxClick = () => {
    setWithdrawAmount(suppliedBalance)
  }

  const handleMaxClick = () => {
    setAmount(walletBalance)
  }

  const canSupply = parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(walletBalance)
  const canWithdraw = parseFloat(suppliedBalance) > 0
  const canWithdrawAmount = withdrawAmount 
    ? parseFloat(withdrawAmount) > 0 && parseFloat(withdrawAmount) <= parseFloat(suppliedBalance)
    : true // Allow withdraw all if no amount specified

  return (
    <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-0">Aave WETH Lending</h2>
          <div className="text-left sm:text-right">
            <p className="text-xs sm:text-sm text-slate-400">Supplied Balance</p>
            {isLoadingSupplied ? (
              <div className="animate-pulse">
                <div className="h-5 sm:h-6 bg-slate-600 rounded w-20"></div>
              </div>
            ) : (
              <>
                <p className="text-base sm:text-lg font-bold text-green-400">
                  {parseFloat(suppliedBalance).toFixed(6)} WETH
                </p>
              </>
            )}
          </div>
        </div>
        
        {/* APY Display */}
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-300">Current Supply APY</span>
            </div>
            <div className="text-right">
              {isAPYLoading ? (
                <div className="animate-pulse bg-green-700 rounded w-12 h-4"></div>
              ) : (
                <span className="text-lg font-bold text-green-300">
                  {formatAPY(apy)}
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-green-400 mt-1">
            Earn interest on your supplied WETH
          </p>
        </div>
      </div>

      {/* Sponsored Transaction Badge - Only show for smart wallet mode */}
      {useSmartWallet && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-300">💳 Sponsored Transactions</p>
              <p className="text-xs text-blue-400">All supply and withdraw operations sponsored by Pimlico</p>
            </div>
          </div>
        </div>
      )}

      {/* Supply Section */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Supply WETH to Aave
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 sm:px-4 py-3 pr-16 sm:pr-20 text-base sm:text-lg bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400"
              disabled={isSupplying}
            />
            <button
              onClick={handleMaxClick}
              className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
              disabled={isSupplying}
            >
              MAX
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm text-slate-400 mt-1 space-y-1 sm:space-y-0">
            <div>
              <span>Available: {parseFloat(walletBalance).toFixed(6)} WETH</span>
            </div>
            {amount && (
              <div className="flex flex-col sm:items-end">
                <span className={canSupply ? 'text-green-400' : 'text-red-400'}>
                  {canSupply ? '✓ Valid amount' : '✗ Insufficient balance'}
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSupply}
          disabled={!canSupply || isSupplying}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSupplying ? (
            <div className="flex items-center justify-center space-x-2">
              <LoadingSpinner size="md" color="white" />
              <span>Supplying...</span>
            </div>
          ) : (
            'Supply WETH'
          )}
        </button>
      </div>

      {/* Withdraw Section */}
      <div className="border-t border-slate-600 pt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Withdraw WETH from Aave
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="0.0"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full px-4 py-3 pr-20 text-lg bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-slate-400"
              disabled={isWithdrawing}
            />
            <button
              onClick={handleWithdrawMaxClick}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
              disabled={isWithdrawing}
            >
              MAX
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm text-slate-400 mt-1 space-y-1 sm:space-y-0">
            <div>
              <span>Available: {parseFloat(suppliedBalance).toFixed(6)} WETH</span>
            </div>
            {withdrawAmount && (
              <div className="flex flex-col sm:items-end">
                <span className={canWithdrawAmount ? 'text-green-400' : 'text-red-400'}>
                  {canWithdrawAmount ? '✓ Valid amount' : '✗ Insufficient balance'}
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleWithdraw}
          disabled={!canWithdraw || !canWithdrawAmount || isWithdrawing}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isWithdrawing ? (
            <div className="flex items-center justify-center space-x-2">
              <LoadingSpinner size="md" color="white" />
              <span>Withdrawing...</span>
            </div>
          ) : (
            withdrawAmount 
              ? `Withdraw ${parseFloat(withdrawAmount).toFixed(6)} WETH`
              : `Withdraw All (${parseFloat(suppliedBalance).toFixed(6)} WETH)`
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
        <h3 className="font-medium text-blue-300 mb-2">How it works</h3>
        <ul className="text-sm text-blue-200 space-y-1">
          <li>• Supply WETH to earn interest on Aave</li>
          <li>• Your WETH is converted to aWETH tokens</li>
          <li>• Withdraw anytime to get your WETH back</li>
        </ul>
      </div>
    </div>
  )
}