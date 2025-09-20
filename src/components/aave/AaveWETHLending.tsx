import React, { useState, useEffect } from 'react'
import { useAaveWETHOperations } from '../../hooks/useAaveWETHOperations'
import { useWETHBalance } from '../../hooks/useWETHBalance'
import { useAaveAPY } from '../../hooks/useAaveAPY'

export const AaveWETHLending: React.FC = () => {
  const { balance: walletBalance, refetch: refetchWalletBalance } = useWETHBalance()
  const { supplyWETH, withdrawWETH, getSuppliedBalance, isSupplying, isWithdrawing, error } = useAaveWETHOperations(refetchWalletBalance)
  const { apy, formatAPY, convertWETHToUSD, isLoading: isAPYLoading } = useAaveAPY()
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
  }, [])

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
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-0">Aave WETH Lending</h2>
          <div className="text-left sm:text-right">
            <p className="text-xs sm:text-sm text-gray-600">Supplied Balance</p>
            {isLoadingSupplied ? (
              <div className="animate-pulse">
                <div className="h-5 sm:h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ) : (
              <>
                <p className="text-base sm:text-lg font-bold text-green-600">
                  {parseFloat(suppliedBalance).toFixed(6)} WETH
                </p>
                <p className="text-xs text-gray-400">
                  {convertWETHToUSD(suppliedBalance)}
                </p>
              </>
            )}
          </div>
        </div>
        
        {/* APY Display */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">Current Supply APY</span>
            </div>
            <div className="text-right">
              {isAPYLoading ? (
                <div className="animate-pulse bg-green-200 rounded w-12 h-4"></div>
              ) : (
                <span className="text-lg font-bold text-green-700">
                  {formatAPY(apy)}
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-green-600 mt-1">
            Earn interest on your supplied WETH
          </p>
        </div>
      </div>

      {/* Supply Section */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Supply WETH to Aave
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 sm:px-4 py-3 pr-16 sm:pr-20 text-base sm:text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm text-gray-600 mt-1 space-y-1 sm:space-y-0">
            <div>
              <span>Available: {parseFloat(walletBalance).toFixed(6)} WETH</span>
              <span className="text-gray-400 ml-2">({convertWETHToUSD(walletBalance)})</span>
            </div>
            {amount && (
              <div className="flex flex-col sm:items-end">
                <span className={canSupply ? 'text-green-600' : 'text-red-600'}>
                  {canSupply ? '✓ Valid amount' : '✗ Insufficient balance'}
                </span>
                {amount && canSupply && (
                  <span className="text-gray-400 text-xs">
                    ≈ {convertWETHToUSD(amount)}
                  </span>
                )}
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
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Supplying...</span>
            </div>
          ) : (
            'Supply WETH'
          )}
        </button>
      </div>

      {/* Withdraw Section */}
      <div className="border-t border-gray-200 pt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Withdraw WETH from Aave
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="0.0"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full px-4 py-3 pr-20 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
          <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm text-gray-600 mt-1 space-y-1 sm:space-y-0">
            <div>
              <span>Available: {parseFloat(suppliedBalance).toFixed(6)} WETH</span>
              <span className="text-gray-400 ml-2">({convertWETHToUSD(suppliedBalance)})</span>
            </div>
            {withdrawAmount && (
              <div className="flex flex-col sm:items-end">
                <span className={canWithdrawAmount ? 'text-green-600' : 'text-red-600'}>
                  {canWithdrawAmount ? '✓ Valid amount' : '✗ Insufficient balance'}
                </span>
                {withdrawAmount && canWithdrawAmount && (
                  <span className="text-gray-400 text-xs">
                    ≈ {convertWETHToUSD(withdrawAmount)}
                  </span>
                )}
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
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">How it works</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Supply WETH to earn interest on Aave</li>
          <li>• Your WETH is converted to aWETH tokens</li>
          <li>• Withdraw anytime to get your WETH back</li>
          <li>• All transactions use your connected wallet (Rabby/MetaMask)</li>
        </ul>
      </div>
    </div>
  )
}