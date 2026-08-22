export function formatInr(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n)
}

// Alias for backward compatibility
export const formatUsd = formatInr
export const formatCurrency = formatInr
