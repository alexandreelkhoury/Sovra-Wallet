# ETH/USDT Swap Implementation Plan for Base Sepolia

## Research Summary

Based on research, the best options for ETH/USDT swaps on Base Sepolia are:

### 1. **Primary Option: Uniswap V3 Style Router**
- **Router Address**: `0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45` (SwapRouter02)
- **Alternative**: `0xe592427a0aece92de3edee1f18e0157c05861564` (SwapRouter)
- **Protocol**: Standard Uniswap V3 interface
- **Liquidity**: Need to verify ETH/USDT pools exist

### 2. **Fallback Option: Custom DEX Router**
- **Router Address**: `0x6682375ebC1dF04676c0c5050934272368e6e883` (detected in transactions)
- **Status**: Needs verification
- **Usage**: If Uniswap V3 not available

### 3. **Token Addresses**
- **USDT**: `0xf46318aa5d26a20683ae2390ea2777efc22cf89f` (current)
- **WETH**: `0x4200000000000000000000000000000000000006` (Base WETH)
- **Native ETH**: Will be wrapped automatically

## Implementation Strategy

### Phase 1: Core Swap Service
1. **Create SwapService class** with methods:
   - `swapETHToUSDT(ethAmount: string, minUSDTOut: string)`
   - `swapUSDTToETH(usdtAmount: string, minETHOut: string)`
   - `getSwapQuote(tokenIn: string, tokenOut: string, amountIn: string)`
   - `checkLiquidity(tokenA: string, tokenB: string)`

2. **Router Integration**:
   - Support Uniswap V3 SwapRouter02 interface
   - Implement exact input swaps
   - Handle slippage protection
   - Support deadline parameters

### Phase 2: Frontend Components
1. **SwapInterface Component**:
   - Token input/output fields
   - Swap direction toggle
   - Quote display with price impact
   - Slippage settings
   - Transaction confirmation

2. **Price Oracle Integration**:
   - Real-time price feeds
   - Slippage calculation
   - Impact warnings

### Phase 3: Advanced Features
1. **Multi-Router Support**:
   - Router failover system
   - Best price routing
   - Liquidity aggregation

2. **User Experience**:
   - Transaction status tracking
   - Error handling with retry
   - Gas estimation

## Technical Implementation Details

### Contract Integration
```typescript
// Uniswap V3 SwapRouter02 ABI (key functions)
const SWAP_ROUTER_ABI = [
  "function exactInputSingle(ExactInputSingleParams params) external payable returns (uint256)",
  "function exactOutputSingle(ExactOutputSingleParams params) external payable returns (uint256)"
];

// Swap parameters structure
interface ExactInputSingleParams {
  tokenIn: Address;
  tokenOut: Address;
  fee: number; // Pool fee (500, 3000, 10000)
  recipient: Address;
  deadline: number;
  amountIn: bigint;
  amountOutMinimum: bigint;
  sqrtPriceLimitX96: bigint;
}
```

### Service Architecture
```typescript
class SwapService {
  private client: PrivyWalletClient;
  private router: Address;
  
  async swapETHToUSDT(params: SwapParams): Promise<TransactionResult>;
  async getQuote(params: QuoteParams): Promise<QuoteResult>;
  private async checkPoolExists(tokenA: Address, tokenB: Address): Promise<boolean>;
}
```

### Frontend Component Structure
```
src/
├── components/
│   ├── swap/
│   │   ├── SwapInterface.tsx      # Main swap UI
│   │   ├── TokenSelector.tsx      # Token selection
│   │   ├── SwapButton.tsx         # Swap execution
│   │   ├── PriceDisplay.tsx       # Price and impact info
│   │   └── SwapSettings.tsx       # Slippage, deadline settings
│   └── ...
├── services/
│   ├── swap/
│   │   ├── swapService.ts         # Core swap logic
│   │   ├── priceOracle.ts         # Price fetching
│   │   └── routerABI.ts           # Contract ABIs
│   └── ...
└── types/
    └── swap.ts                    # Swap-related types
```

## Risk Considerations

### 1. **Liquidity Risk**
- ETH/USDT pools may have low liquidity on testnet
- High slippage possible
- May need to create/seed pools

### 2. **Contract Risk**
- Router contracts need verification
- USDT contract compatibility
- Gas optimization for complex swaps

### 3. **User Experience Risk**
- Failed transactions due to insufficient liquidity
- Price impact warnings needed
- Clear error messages

## Success Metrics

1. **Functionality**:
   - ✅ Successful ETH → USDT swaps
   - ✅ Successful USDT → ETH swaps
   - ✅ Accurate price quotes
   - ✅ Proper slippage protection

2. **User Experience**:
   - ✅ Intuitive swap interface
   - ✅ Real-time price updates
   - ✅ Clear transaction feedback
   - ✅ Error handling with guidance

3. **Integration**:
   - ✅ Seamless Privy wallet integration
   - ✅ Works with existing USDT balance
   - ✅ Integrates with Aave lending flow

## Next Steps

1. **Verify Router Contracts**: Test router addresses on Base Sepolia
2. **Check Pool Liquidity**: Verify ETH/USDT pools exist with sufficient liquidity
3. **Implement Core Service**: Build SwapService with basic swap functionality
4. **Create UI Components**: Build user-friendly swap interface
5. **Test & Iterate**: Test with small amounts, refine based on results

## Implementation Timeline

- **Day 1**: Router verification + Core service implementation
- **Day 2**: Frontend components + Basic swap functionality
- **Day 3**: Price oracle + Advanced features + Testing
- **Day 4**: Polish + Error handling + Documentation