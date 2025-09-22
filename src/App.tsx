import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { privyConfig, wagmiConfig, validateEnvironment } from './config/privy'
import { SimpleWalletProvider } from './context/SimpleWalletContext'
import { WETHBalanceProvider } from './context/WETHBalanceContext'
import { ToastProvider } from './components/ui/Toast'
import Layout from './components/layout/Layout'
import ErrorBoundary from './components/ui/ErrorBoundary'

// Smart Wallets Provider for gas sponsorship
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets'

// Create a client for React Query (required by Wagmi v2)
const queryClient = new QueryClient()

// Validate environment on app start
validateEnvironment()

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <PrivyProvider
            appId={privyConfig.appId}
            config={privyConfig.config}
          >
            <SmartWalletsProvider
              config={{
                // Configure Pimlico paymaster for Base Sepolia sponsored transactions
                paymasterContext: {
                  type: 'paymaster_service',
                  paymasterUrl: 'https://api.pimlico.io/v2/84532/rpc?apikey=pim_4GzrQxLTP4cDUMbXLySeao'
                }
              }}
            >
              <SimpleWalletProvider>
                <WETHBalanceProvider>
                  <ToastProvider>
                    <Layout />
                  </ToastProvider>
                </WETHBalanceProvider>
              </SimpleWalletProvider>
            </SmartWalletsProvider>
          </PrivyProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App