import { PrivyWalletClient } from '../privy/client'
import { formatBalance } from '../../utils/formatters'
import { type Address } from 'viem'

export class USDCService {
  private privyClient: PrivyWalletClient

  constructor(privyClient: PrivyWalletClient) {
    this.privyClient = privyClient
  }

  async getBalance(address: string): Promise<string> {
    const rawBalance = await this.privyClient.getUSDCBalance(address as Address)
    return formatBalance(rawBalance)
  }

  async validateAmount(amount: string, currentBalance: string): Promise<boolean> {
    const numAmount = parseFloat(amount)
    const numBalance = parseFloat(currentBalance)
    
    if (isNaN(numAmount) || numAmount <= 0) {
      return false
    }
    
    return numAmount <= numBalance
  }

  formatUSDCAmount(amount: string): string {
    return `${amount} USDC`
  }
}

export default USDCService