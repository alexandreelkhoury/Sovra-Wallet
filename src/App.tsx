import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { privyConfig, wagmiConfig, validateEnvironment } from './config/privy'
import { SimpleWalletProvider } from './context/SimpleWalletContext'
import { ToastProvider } from './components/ui/Toast'
import Layout from './components/layout/Layout'
import ErrorBoundary from './components/ui/ErrorBoundary'

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
            <SimpleWalletProvider>
              <ToastProvider>
                <Layout />
              </ToastProvider>
            </SimpleWalletProvider>
          </PrivyProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App