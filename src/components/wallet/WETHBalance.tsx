import React from 'react'
import { useWETHBalance } from '../../hooks/useWETHBalance'
import { useAaveAPY } from '../../hooks/useAaveAPY'

export const WETHBalance: React.FC = () => {
  const { balance, isLoading, error, refetch } = useWETHBalance()
  const { convertWETHToUSD, formatPrice, priceUSD, isLoading: isPriceLoading } = useAaveAPY()

  const handleRefresh = () => {
    refetch()
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-gray-800">WETH Balance</h2>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          title="Refresh WETH Balance"
        >
          <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {/* WETH Balance */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                {/* ETH Logo SVG */}
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" viewBox="0 0 256 417" fill="currentColor">
                  <path d="M127.9611 0L125.1 9.5v285.168l2.8611 2.86L256 206.1732 127.9611 0z"/>
                  <path d="M127.9611 0L0 206.1732l127.9611 91.3548V157.7084 0z"/>
                  <path d="M127.9611 416.9995L125.1 412.0498v-74.4223l2.8611-2.8612L256 244.2932l-128.0389 172.7063z"/>
                  <path d="M127.9611 334.7663v82.233l127.9611-172.7063-127.9611 90.4733z"/>
                  <path d="M127.9611 297.5279L256 206.1732l-128.0389-48.4648v139.9195z"/>
                  <path d="M0 206.1732L127.9611 297.5279v-139.9195L0 206.1732z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Wrapped Ethereum</h3>
                <p className="text-xs sm:text-sm text-gray-600">Base Sepolia</p>
              </div>
            </div>
            <div className="text-right">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ) : error ? (
                <div className="text-red-500">
                  <p className="text-lg font-bold">Error</p>
                  <p className="text-xs">{error}</p>
                </div>
              ) : (
                <>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {parseFloat(balance).toFixed(6)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">WETH</p>
                  {!isPriceLoading && (
                    <p className="text-xs text-gray-400 mt-1">
                      {convertWETHToUSD(balance)}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Price Info */}
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">WETH Price</span>
            <span className="font-medium text-gray-900">
              {isPriceLoading ? (
                <div className="animate-pulse bg-gray-200 rounded w-16 h-4"></div>
              ) : (
                formatPrice(priceUSD)
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}