export function formatBalance(balance: string, decimals = 2): string {
  const num = parseFloat(balance)
  if (isNaN(num)) return '0.00'
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatTransactionHash(hash: string): string {
  if (!hash || hash.length < 10) return hash
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`
}

export function formatCurrency(amount: string, currency = 'USD'): string {
  const num = parseFloat(amount)
  if (isNaN(num)) return `$0.00`
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(num)
}

export function parseInputAmount(input: string): string {
  // Remove any non-digit, non-decimal characters
  const cleaned = input.replace(/[^\d.]/g, '')
  
  // Ensure only one decimal point
  const parts = cleaned.split('.')
  if (parts.length > 2) {
    return `${parts[0]}.${parts.slice(1).join('')}`
  }
  
  return cleaned
}