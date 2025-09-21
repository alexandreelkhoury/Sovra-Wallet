import React from 'react'
import { useWETHBalanceContext } from '../../context/WETHBalanceContext'

export const WETHBalance: React.FC = () => {
  const { balance, isLoading, error, refetch } = useWETHBalanceContext()

  const handleRefresh = () => {
    refetch()
  }

  return (
    <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-4 sm:p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-white">WETH Balance</h2>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          title="Refresh WETH Balance"
        >
          <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {/* WETH Balance */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl p-3 sm:p-4 border border-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                {/* Simplified ETH Logo */}
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L5.5 13.5L12 16.5L18.5 13.5L12 2Z"/>
                  <path d="M5.5 15L12 18L18.5 15L12 22L5.5 15Z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm sm:text-base">Wrapped Ethereum</h3>
                <p className="text-xs sm:text-sm text-slate-300">Base Sepolia</p>
              </div>
            </div>
            <div className="text-right">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-slate-600 rounded w-24 mb-1"></div>
                  <div className="h-4 bg-slate-600 rounded w-16"></div>
                </div>
              ) : error ? (
                <div className="text-red-400">
                  <p className="text-lg font-bold">Error</p>
                  <p className="text-xs">{error}</p>
                </div>
              ) : (
                <>
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    {parseFloat(balance).toFixed(6)}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-300">WETH</p>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}