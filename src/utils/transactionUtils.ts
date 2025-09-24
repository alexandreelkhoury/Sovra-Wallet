import { useWallets, useSendTransaction } from '@privy-io/react-auth'
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets'
import { useWallet } from '../context/SimpleWalletProvider'

export interface TransactionParams {
  to: `0x${string}`
  data: `0x${string}`
}

export function useTransactionSender() {
  const { wallets } = useWallets()
  const { client: smartWalletClient } = useSmartWallets()
  const { sendTransaction } = useSendTransaction()
  const { useSmartWallet } = useWallet()

  const sendTransactionByMode = async (params: TransactionParams): Promise<{ hash: string }> => {
    if (useSmartWallet) {
      // 🤖 Smart wallet: Seamless gasless transaction (no user confirmation needed)
      // User doesn't need to know about blockchain - just works!
      if (!smartWalletClient) {
        throw new Error('Smart wallet client not available for sponsored transaction')
      }
      const hash = await smartWalletClient.sendTransaction(params, {
        uiOptions: { showWalletUIs: false } // Hide modal for smart wallet
      })
      return { hash }
    } else {
      // 👤 Normal wallet: Show confirmation modal (user pays gas)
      // User needs to approve transaction and pay gas fees
      const result = await sendTransaction(params, {
        uiOptions: { showWalletUIs: true } // Show modal for normal wallet
      })
      return result
    }
  }

  return {
    sendTransactionByMode,
    useSmartWallet,
    smartWalletClient,
    activeWallet: wallets.find(wallet => wallet.connectorType === 'injected') || wallets[0]
  }
}