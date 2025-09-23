import React from 'react'
import { useWallet } from '../../context/SimpleWalletProvider'

export const WalletModeToggle: React.FC = () => {
  const { walletMode, setWalletMode, isSmartWalletAvailable } = useWallet()

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white mb-1">
            🎯 Demo Mode
          </h3>
          <p className="text-xs text-slate-400">
            Switch between smart and normal wallet modes
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setWalletMode('normal')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              walletMode === 'normal'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            💳 Normal Wallet
          </button>
          
          <button
            onClick={() => setWalletMode('smart')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              walletMode === 'smart'
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            🔒 Smart Wallet
          </button>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-slate-700">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            walletMode === 'smart' ? 'bg-green-500' : 'bg-blue-500'
          }`} />
          <span className="text-xs text-slate-300">
            {walletMode === 'smart' 
              ? isSmartWalletAvailable 
                ? '🔒 Smart wallet mode active - All transactions sponsored by Pimlico'
                : '🔒 Smart wallet mode selected - Will fallback to normal wallet (Smart wallet not available)'
              : '💳 Normal wallet mode active - User pays gas fees'
            }
          </span>
        </div>
        
        {walletMode === 'smart' && !isSmartWalletAvailable && (
          <div className="mt-2 text-xs text-amber-400">
            ⚠️ Smart wallet not available - transactions will use normal wallet with user gas fees
          </div>
        )}
      </div>
    </div>
  )
}