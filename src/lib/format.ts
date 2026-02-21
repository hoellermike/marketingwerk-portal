const deAT = 'de-AT'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(deAT, { style: 'currency', currency: 'EUR' }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(deAT).format(value)
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat(deAT, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value / 100)
}

export function formatDate(value: string | null): string {
  if (!value) return '–'
  return new Intl.DateTimeFormat(deAT).format(new Date(value))
}

export function daysRemaining(endDate: string | null): number | null {
  if (!endDate) return null
  const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000)
  return diff > 0 ? diff : 0
}
