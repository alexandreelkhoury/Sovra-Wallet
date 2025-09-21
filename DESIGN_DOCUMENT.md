# Sovra Wallet - Design Document

## Executive Summary

Sovra Wallet is a browser-based Web3 wallet implementing **WETH balance viewing and Aave lending pool integration** through Privy with account abstraction for seamless user experience. The application provides send/receive functionality and Aave V3 lending operations on Base Sepolia testnet.

## Technology Choices

### Frontend Framework: React 18 + TypeScript
**Rationale:**
- **Component-based architecture** enables modular, reusable UI components essential for wallet interfaces
- **TypeScript** provides type safety crucial for handling cryptocurrency transactions and wallet operations
- **Large ecosystem** with extensive crypto/wallet libraries (viem, wagmi)
- **Excellent developer experience** with hot reloading and debugging tools
- **Strong community support** for blockchain integrations

### Styling: Tailwind CSS
**Rationale:**
- **Utility-first approach** enables rapid responsive design development
- **Consistent design system** through standardized spacing, colors, and typography
- **Mobile-first responsive design** built-in for excellent mobile wallet experience
- **Dark theme implementation** with slate color palette for better user experience
- **Minimal bundle size** with automatic purging of unused styles

### State Management: React Built-in State + Context API
**Rationale:**
- **Zero additional dependencies** - uses only React's built-in state management
- **Focused requirements** - WETH balance, transaction state, and Aave positions
- **Lightweight approach** - perfect for this wallet application scope
- **Shared balance context** - ensures UI synchronization across all components

### Build Tool: Vite
**Rationale:**
- **Lightning-fast development** with instant Hot Module Replacement (HMR)
- **Optimized production builds** with tree-shaking and code splitting
- **Modern ES modules** support out of the box
- **Buffer polyfill support** for cryptographic operations in browser environment
- **Better performance** than traditional bundlers like Webpack

### Blockchain Integration: Privy + Account Abstraction
**Rationale:**
- **Account abstraction** provides seamless user experience without seed phrases
- **Smart contract wallets** enable enhanced security and user experience
- **Multiple login methods** including email, social, and traditional wallets
- **Embedded wallets** created automatically for users without existing wallets
- **Simplified UX** eliminates complex wallet management for end users

### Blockchain Interaction: Viem + Wagmi
**Rationale:**
- **Type-safe contract interactions** through Viem's TypeScript ABI support
- **Real-time balance queries** using Wagmi's React hooks
- **Transaction management** with built-in retry logic and status tracking
- **Modern architecture** replacing legacy web3.js with lightweight, performant alternatives
- **Base Sepolia native support** for testnet operations

## Key Architectural Decisions

### 1. Wallet Architecture: Injected vs Embedded Wallet Priority
**Decision:** Prioritize injected wallets (MetaMask, Rabby) over embedded wallets
```typescript
const activeWallet = wallets.find(wallet => wallet.connectorType === 'injected') || wallets[0]
```
**Rationale:**
- Users prefer using their existing, familiar wallets
- Better security model with user-controlled private keys
- Eliminates network switching warnings for embedded wallet users who cannot change networks

### 2. Token Selection: WETH over USDC
**Decision:** Complete migration from USDC to WETH (Wrapped Ethereum)
**Rationale:**
- **Base Sepolia Compatibility**: USDC is not supported by Aave V3 on Base Sepolia testnet
- **Native WETH Support**: WETH (`0x4200000000000000000000000000000000000006`) is fully supported
- **Aave Integration**: Direct compatibility with Aave V3 lending pools
- **Transaction Success**: Eliminates failed transactions due to unsupported tokens

### 3. Component Architecture: Feature-Based Organization
```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── wallet/       # WETH balance, send/receive functionality
│   ├── aave/         # Aave lending interface components
│   └── layout/       # App layout and navigation
├── hooks/            # Custom React hooks for wallet operations
├── context/          # React Context providers (wallet state, balance management)
└── utils/            # Formatting and utility functions
```
**Rationale:**
- **Clear separation of concerns** between UI, business logic, and blockchain operations
- **Reusable components** reduce code duplication and improve maintainability
- **Custom hooks** encapsulate complex blockchain interactions
- **Context providers** ensure state synchronization across components

### 4. Transaction Flow: Two-Phase Aave Operations
**Decision:** Implement approve-then-supply pattern for Aave lending
```typescript
// Phase 1: Approve WETH spending
const approveData = encodeFunctionData({
  abi: erc20Abi,
  functionName: 'approve',
  args: [AAVE_POOL_ADDRESS, amountInWei],
})

// Phase 2: Supply to Aave
const supplyData = encodeFunctionData({
  abi: aavePoolAbi,
  functionName: 'supply',
  args: [WETH_ADDRESS, amountInWei, userAddress, 0],
})
```
**Rationale:**
- **ERC-20 Standard Compliance**: Required approval pattern for token transfers
- **Security**: User explicitly approves each transaction
- **Transparency**: Clear transaction flow for user understanding

### 5. Error Handling: Multi-Layer Approach
**Decision:** Implement comprehensive error handling at component, hook, and service levels
**Rationale:**
- **User Experience**: Graceful degradation when errors occur
- **Development Experience**: Clear error messages during development
- **Production Ready**: Prevents app crashes from unhandled exceptions
- **Financial Application Standards**: Critical for handling monetary transactions

### 6. UI/UX Design: Mobile-First Dark Theme
**Decision:** Dark theme with mobile-first responsive design
**Rationale:**
- **User Comfort**: Dark theme reduces eye strain during extended use
- **Mobile Dominance**: Crypto wallet users primarily use mobile devices
- **Modern Aesthetics**: Professional appearance suitable for financial applications
- **Accessibility**: Better contrast and readability in various lighting conditions

### 7. State Synchronization: Shared Balance Context
**Decision:** Implement `WETHBalanceContext` for cross-component balance updates
```typescript
export const WETHBalanceProvider: React.FC<WETHBalanceProviderProps> = ({ children }) => {
  const wethBalance = useWETHBalance()
  return (
    <WETHBalanceContext.Provider value={wethBalance}>
      {children}
    </WETHBalanceContext.Provider>
  )
}
```
**Rationale:**
- **UI Consistency**: Balance updates reflect across all components simultaneously
- **Real-time Updates**: Automatic refresh after send/supply/withdraw operations
- **Performance**: Single source of truth eliminates redundant API calls

### 8. QR Code Integration: MetaMask Deep Links
**Decision:** Generate QR codes with MetaMask deep links for easy sending
```typescript
const metamaskDeepLink = `https://metamask.app.link/send/${address}@${chainId}`
```
**Rationale:**
- **User Experience**: One-scan solution for initiating transfers
- **Cross-device Compatibility**: Works on both mobile and desktop
- **Standard Protocol**: Follows established MetaMask deep link format

## Technical Implementation Details

### Contract Addresses (Base Sepolia)
- **WETH**: `0x4200000000000000000000000000000000000006`
- **Aave V3 Pool**: `0x8bAB6d1b75f19e9eD9fCe8b9BD338844fF79aE27`
- **aWETH Token**: `0x73a5bB60b0B0fc35710DDc0ea9c407031E31Bdbb`

### Performance Optimizations
- **Bundle Size**: Optimized to ~25 TypeScript files with unused code removed
- **Code Splitting**: Route-based and component-based lazy loading ready
- **Caching Strategy**: Automatic balance caching through Wagmi hooks
- **Buffer Polyfill**: Configured for Privy embedded wallet compatibility

### Security Considerations
- **Account Abstraction**: Smart contract wallets eliminate seed phrase management
- **Privy Authentication**: Secure multi-method user authentication
- **Input Validation**: Strict validation for all transaction parameters
- **Transaction Simulation**: Preview transactions before execution
- **No Private Key Storage**: All key management handled by Privy

## Deployment & Integration

### Environment Configuration
```bash
VITE_PRIVY_APP_ID=cmeigbb8q00u5ky0bv70pell5
VITE_BASE_SEPOLIA_RPC=https://sepolia.base.org
```

### Production Readiness
- **Static Hosting**: Compatible with Vercel, Netlify, or any static host
- **CSP Headers**: Structure supports Content Security Policy implementation
- **Error Monitoring**: Structured logging ready for production monitoring
- **TypeScript Strict Mode**: Maximum type safety for production reliability

## Testing & Validation

### Functional Testing Results
- ✅ WETH balance display and refresh
- ✅ Send WETH with transaction confirmation
- ✅ Receive WETH with QR code generation
- ✅ Aave supply operations (approve + supply)
- ✅ Aave withdraw operations
- ✅ Real-time balance synchronization
- ✅ Network switching and wallet connection
- ✅ Mobile responsive design
- ✅ Error handling and edge cases

### Contract Integration Verification
- ✅ WETH contract interactions on Base Sepolia
- ✅ Aave V3 Pool integration with correct addresses
- ✅ Transaction success rates and proper error handling
- ✅ Balance tracking via aWETH interest-bearing tokens

## Conclusion

Sovra Wallet demonstrates a production-ready Web3 wallet implementation with modern architecture, comprehensive functionality, and excellent user experience. The technology choices prioritize type safety, performance, and user experience while maintaining security standards appropriate for financial applications.

The architectural decisions enable easy maintenance, testing, and future feature expansion while providing a solid foundation for a full-featured cryptocurrency wallet.