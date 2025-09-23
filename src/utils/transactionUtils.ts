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
      // Use smart wallet for sponsored transaction
      if (!smartWalletClient) {
        throw new Error('Smart wallet client not available for sponsored transaction')
      }
      const hash = await smartWalletClient.sendTransaction(params)
      return { hash }
    } else {
      // Use normal wallet with gas fees
      const result = await sendTransaction(params)
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