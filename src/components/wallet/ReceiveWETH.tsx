import React, { useState, useEffect, useRef } from 'react'
import { useWallet } from '../../context/SimpleWalletProvider'
import { useAccount } from 'wagmi'
import QRCode from 'qrcode'
import { ExpandableCard } from '../ui/ExpandableCard'

export const ReceiveWETH: React.FC = () => {
  const { walletState } = useWallet()
  const { chain } = useAccount()
  const [copied, setCopied] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState(false)
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

  const handleCopyAddress = async () => {
    if (walletState.address) {
      try {
        await navigator.clipboard.writeText(walletState.address)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy address:', error)
      }
    }
  }

  const getNetworkName = () => {
    if (chain?.id === 84532) {
      return 'Base Sepolia Testnet'
    }
    return 'Base Sepolia Testnet' // Default to Base Sepolia since that's what this app is designed for
  }

  // Generate QR code when wallet address changes
  useEffect(() => {
    const generateQRCode = async () => {
      if (walletState.address && qrCanvasRef.current && isExpanded) {
        try {
          // Create MetaMask deep link for sending to this address
          // Format: https://metamask.app.link/send/[address]@[chainId]
          const chainId = chain?.id || 84532 // Default to Base Sepolia
          const metamaskDeepLink = `https://metamask.app.link/send/${walletState.address}@${chainId}`
          
          console.log('Generating QR code for:', metamaskDeepLink)
          
          // Clear canvas first
          const canvas = qrCanvasRef.current
          const ctx = canvas.getContext('2d')
          ctx?.clearRect(0, 0, canvas.width, canvas.height)
          
          // Generate QR code with MetaMask deep link
          await QRCode.toCanvas(canvas, metamaskDeepLink, {
            width: 160,
            margin: 2,
            color: {
              dark: '#1f2937', // Dark gray
              light: '#ffffff', // White
            },
            errorCorrectionLevel: 'M',
          })
          
          // Also generate data URL for download functionality
          const dataUrl = await QRCode.toDataURL(metamaskDeepLink, {
            width: 256,
            margin: 2,
            color: {
              dark: '#1f2937',
              light: '#ffffff',
            },
            errorCorrectionLevel: 'M',
          })
          setQrCodeUrl(dataUrl)
          
          console.log('QR code generated successfully')
        } catch (error) {
          console.error('Failed to generate QR code:', error)
        }
      }
    }

    // Add a small delay to ensure the canvas is properly mounted when expanded
    if (isExpanded) {
      setTimeout(generateQRCode, 100)
    }
  }, [walletState.address, chain?.id, isExpanded])

  const handleDownloadQR = () => {
    if (qrCodeUrl && walletState.address) {
      const link = document.createElement('a')
      link.download = `wallet-qr-${walletState.address.slice(0, 8)}.png`
      link.href = qrCodeUrl
      link.click()
    }
  }

  if (!walletState.isConnected || !walletState.address) {
    return null
  }

  const receiveIcon = (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  )

  return (
    <ExpandableCard
      title="Receive WETH"
      icon={receiveIcon}
      iconColor="bg-green-500"
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
    >
          <div className="space-y-4">
            {/* Network Info */}
            <div className="bg-slate-700 rounded-xl p-3 sm:p-4 border border-slate-600">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L5.5 13.5L12 16.5L18.5 13.5L12 2Z"/>
                    <path d="M5.5 15L12 18L18.5 15L12 22L5.5 15Z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm sm:text-base">Receiving Network</h3>
                  <p className="text-xs sm:text-sm text-slate-300">{getNetworkName()}</p>
                </div>
              </div>
              
              <div className="text-xs sm:text-sm text-slate-200 bg-slate-600/50 rounded-lg p-2">
                <p className="font-medium mb-1">⚠️ Important:</p>
                <p>Only send WETH or ETH on {getNetworkName()}. Sending from other networks will result in loss of funds.</p>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="bg-slate-700 rounded-xl p-3 sm:p-4 border border-slate-600">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-white text-sm">Your Wallet Address</h4>
                <span className="text-xs text-slate-400">Click to copy</span>
              </div>
              
              <button
                onClick={handleCopyAddress}
                className="w-full bg-slate-600 border border-slate-500 rounded-lg p-3 text-left hover:bg-slate-500 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs sm:text-sm text-white break-all leading-relaxed">
                    {walletState.address}
                  </span>
                  <div className="ml-2 flex-shrink-0">
                    {copied ? (
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-slate-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
              
              {copied && (
                <p className="text-sm text-green-400 mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Address copied to clipboard!
                </p>
              )}
            </div>

            {/* QR Code & MetaMask Deep Link */}
            <div className="bg-slate-700 rounded-xl p-3 sm:p-4 border border-slate-600">
              {/* QR Code */}
              <div className="text-center">
                <div className="w-40 h-40 bg-white border border-slate-500 rounded-lg mx-auto flex items-center justify-center mb-4 p-2">
                  <canvas
                    ref={qrCanvasRef}
                    width={160}
                    height={160}
                    className="max-w-full max-h-full"
                    style={{ 
                      imageRendering: 'pixelated',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-300">Scan to open MetaMask send page</p>
                  {qrCodeUrl && (
                    <button
                      onClick={handleDownloadQR}
                      className="text-sm text-blue-400 hover:text-blue-300 underline font-medium"
                      title="Download QR Code"
                    >
                      Download QR Code
                    </button>
                  )}
                </div>
              </div>
            </div>
      </div>
    </ExpandableCard>
  )
}