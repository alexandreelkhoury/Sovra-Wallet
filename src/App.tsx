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
                // Enable gas sponsorship - transactions will be sponsored when configured in Privy Dashboard
                // No additional configuration needed as user enabled gas sponsorship in dashboard
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