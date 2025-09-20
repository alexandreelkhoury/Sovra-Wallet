import React from 'react'
import Button from '../ui/Button'
import { NetworkSwitcher } from '../ui/NetworkSwitcher'
import { useWallet } from '../../context/SimpleWalletContext'
import { usePrivy } from '@privy-io/react-auth'
import { formatAddress } from '../../utils/formatters'

const Header: React.FC = () => {
  const { walletState } = useWallet()
  const { login, logout } = usePrivy()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">S</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 hidden xs:block">SOVRA Wallet</h1>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 block xs:hidden">SOVRA</h1>
          </div>

          {/* Network Switcher & Wallet Connection */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Network Switcher - Hide on mobile, only show on sm+ screens when connected */}
            {walletState.isConnected && (
              <div className="hidden sm:block">
                <NetworkSwitcher />
              </div>
            )}
            
            {walletState.isConnected ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {formatAddress(walletState.address || '')}
                  </p>
                  <p className="text-xs text-gray-500">Connected</p>
                </div>
                
                {/* Mobile: Just show address, no "Connected" label */}
                <div className="text-right block sm:hidden">
                  <p className="text-xs font-medium text-gray-900">
                    {formatAddress(walletState.address || '')}
                  </p>
                </div>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={logout}
                  className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={login}
                loading={walletState.isLoading}
                disabled={walletState.isLoading}
                size="sm"
                className="text-xs sm:text-sm px-3 sm:px-4 py-2"
              >
                {walletState.isLoading ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header