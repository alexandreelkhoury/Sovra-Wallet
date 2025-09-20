import React from 'react'
import { useAccount } from 'wagmi'
import Header from './Header'
import { WETHBalance } from '../wallet/WETHBalance'
import { AaveWETHLending } from '../aave/AaveWETHLending'
import { useWallet } from '../../context/SimpleWalletContext'

const Layout: React.FC = () => {
  const { walletState } = useWallet()
  const { chain } = useAccount()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Network Warning */}
        {walletState.isConnected && chain?.id !== 84532 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.598 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="font-medium text-yellow-800">Wrong Network</h3>
                <p className="text-sm text-yellow-700">
                  Please switch to Base Sepolia testnet to use this app. Click the network switcher in the top right.
                </p>
              </div>
            </div>
          </div>
        )}

        {walletState.isConnected ? (
          <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
            {/* WETH Balance */}
            <WETHBalance />
            
            {/* Aave Lending */}
            <AaveWETHLending />
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to SOVRA Wallet
              </h2>
              
              <p className="text-gray-600 mb-8">
                Connect your wallet to view WETH balances and supply liquidity to Aave lending pools on Base Sepolia testnet.
              </p>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            <p>SOVRA Wallet - Powered by Privy Account Abstraction | Built with React + TypeScript + Tailwind CSS</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout