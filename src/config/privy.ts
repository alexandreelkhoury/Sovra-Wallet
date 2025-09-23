import { baseSepolia } from 'viem/chains'
import { createConfig, http } from 'wagmi'

// Privy configuration
export const privyConfig = {
  appId: import.meta.env.VITE_PRIVY_APP_ID || '',
  config: {
    // Embedded wallets configuration
    embeddedWallets: {
      createOnLogin: 'users-without-wallets' as const,
      noPromptOnSignature: true,
    },
    // Smart wallets configuration - enables account abstraction and gas sponsorship
    smartWallets: {
      // Create smart wallets for all users
      createOnLogin: 'all-users' as const,
    },
    // Appearance customization
    appearance: {
      theme: 'light' as const,
      accentColor: '#676FFF' as `#${string}`,
      logo: undefined,
    },
    // Login methods
    loginMethods: ['email', 'wallet', 'google'] as ("email" | "wallet" | "google")[],
    // Supported chains - Base Sepolia testnet only
    supportedChains: [baseSepolia],
    // Default chain
    defaultChain: baseSepolia,
  },
}

// Wagmi v2 configuration
export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(
      import.meta.env.VITE_BASE_SEPOLIA_RPC || 'https://sepolia.base.org'
    ),
  },
})

// Chain configuration
export const SUPPORTED_CHAINS = [baseSepolia]

// Contract addresses on Base Sepolia testnet
export const CONTRACT_ADDRESSES = {
  WETH: '0x4200000000000000000000000000000000000006', // WETH on Base Sepolia testnet
  AAVE_POOL: '0x8bAB6d1b75f19e9eD9fCe8b9BD338844fF79aE27', // Aave V3 Pool on Base Sepolia
  A_WETH: '0x73a5bB60b0B0fc35710DDc0ea9c407031E31Bdbb', // aBasSepWETH (Aave's aToken for supplied WETH)
} as const

// Validate environment variables
export function validateEnvironment() {
  if (!privyConfig.appId) {
    throw new Error('VITE_PRIVY_APP_ID is required in environment variables')
  }
  
  return true
}