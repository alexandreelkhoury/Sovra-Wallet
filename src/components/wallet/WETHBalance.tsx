import React from 'react'
import { useWETHBalanceContext } from '../../context/WETHBalanceProvider'

export const WETHBalance: React.FC = () => {
  const { balance, isLoading, error } = useWETHBalanceContext()

  return (
    <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-4 sm:p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-white">WETH Balance</h2>
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