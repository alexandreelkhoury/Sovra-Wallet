import React, { useState } from 'react'
import { baseSepolia } from 'viem/chains'
import { useAccount, useSwitchChain } from 'wagmi'
import { LoadingSpinner } from './LoadingSpinner'

export const NetworkSwitcher: React.FC = () => {
  const { chain: currentChain, isConnected } = useAccount()
  const { switchChain, isPending } = useSwitchChain()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Debug logging
  console.log('NetworkSwitcher DEBUG:', {
    currentChain,
    isConnected,
    chainId: currentChain?.id,
    chainName: currentChain?.name,
    isPending
  })

  // Handle network switch to Base Sepolia
  const handleSwitchToBaseSepolia = async () => {
    try {
      await switchChain({ chainId: baseSepolia.id })
      console.log('Successfully switched to Base Sepolia!')
      setIsDropdownOpen(false)
    } catch (error) {
      console.error('Failed to switch to Base Sepolia:', error)
    }
  }

  const getChainInfo = () => {
    if (!currentChain) {
      return { name: 'Unknown', isBaseSepolia: false, colors: 'bg-gray-500 text-white' }
    }

    switch (currentChain.id) {
      case baseSepolia.id:
        return { 
          name: 'Base Sepolia', 
          isBaseSepolia: true, 
          colors: 'bg-green-500 text-white',
          isTestnet: true
        }
      default:
        return { 
          name: currentChain.name || 'Unknown Network', 
          isBaseSepolia: false, 
          colors: 'bg-red-500 text-white',
          isTestnet: false
        }
    }
  }

  const chainInfo = getChainInfo()

  // If no chain detected but wallet is connected via Privy, show switch button
  if (!currentChain) {
    return (
      <button
        onClick={handleSwitchToBaseSepolia}
        disabled={isPending}
        className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
      >
        {isPending ? 'Switching...' : 'Switch to Base Sepolia'}
      </button>
    )
  }

  return (
    <div className="relative">
      {/* Current Network Display */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${chainInfo.colors} hover:opacity-80`}
        disabled={isPending}
      >
        {/* Network Status Indicator */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${chainInfo.isBaseSepolia ? 'bg-white' : 'bg-red-300'} animate-pulse`}></div>
          <span>{chainInfo.name}</span>
          
          {/* Testnet Badge */}
          {chainInfo.isTestnet && (
            <span className="px-2 py-0.5 bg-white/20 rounded text-xs">
              Testnet
            </span>
          )}
          
          {/* Warning for non-Base Sepolia networks */}
          {!chainInfo.isBaseSepolia && (
            <span className="px-2 py-0.5 bg-red-500/20 rounded text-xs">
              Not Base Sepolia
            </span>
          )}
        </div>

        {/* Dropdown Arrow */}
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Network</h3>
            
            {/* Base Sepolia Testnet Option */}
            <button
              onClick={handleSwitchToBaseSepolia}
              disabled={isPending || currentChain?.id === baseSepolia.id}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                currentChain?.id === baseSepolia.id
                  ? 'bg-green-50 border-2 border-green-200 cursor-not-allowed'
                  : 'hover:bg-green-50 border border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Base Sepolia</div>
                  <div className="text-xs text-gray-500">Testnet • ChainID: 84532</div>
                </div>
              </div>
              
              {currentChain?.id === baseSepolia.id && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">Connected</span>
                </div>
              )}
              
              {isPending && (
                <LoadingSpinner size="sm" color="green" />
              )}
            </button>

            {/* App Information */}
            {currentChain?.id !== baseSepolia.id && (
              <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.598 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="text-xs text-yellow-700">
                    <div className="font-medium">Switch Required</div>
                    <div>This app only works on Base Sepolia testnet. Please switch to continue.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        ></div>
      )}
    </div>
  )
}