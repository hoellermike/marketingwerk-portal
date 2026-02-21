import { AlertTriangle, TrendingUp, ShoppingCart } from 'lucide-react'

interface Props {
  creditsAvailable: number
  transactions: { amount: number; date: string; type: string }[]
}

export default function CreditForecast({ creditsAvailable, transactions }: Props) {
  // Calculate weekly burn from last 28 days
  const cutoff = new Date(Date.now() - 28 * 86400000).toISOString()
  const recentDebits = transactions
    .filter(t => t.date >= cutoff && (t.type === 'debit' || t.amount < 0))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const weeklyBurn = recentDebits / 4
  const weeksLeft = weeklyBurn > 0 ? Math.round(creditsAvailable / weeklyBurn) : null

  let color: string
  let bgColor: string
  let icon: typeof TrendingUp
  let text: string
  let showBuy = false

  if (weeksLeft === null || weeklyBurn === 0) {
    color = 'text-gray-500'
    bgColor = 'bg-gray-50'
    icon = TrendingUp
    text = 'Aktuell kein Verbrauch — Prognose nicht verfügbar'
  } else if (weeksLeft > 4) {
    color = 'text-emerald-700'
    bgColor = 'bg-emerald-50'
    icon = TrendingUp
    text = `Bei aktuellem Verbrauch reichen Ihre Credits noch ca. ${weeksLeft} Wochen.`
  } else if (weeksLeft >= 2) {
    color = 'text-amber-700'
    bgColor = 'bg-amber-50'
    icon = AlertTriangle
    text = `Bei aktuellem Verbrauch reichen Ihre Credits noch ca. ${weeksLeft} Wochen. Jetzt Credits nachbestellen!`
  } else {
    color = 'text-red-700'
    bgColor = 'bg-red-50'
    icon = AlertTriangle
    text = `Achtung: Ihre Credits reichen nur noch ca. ${weeksLeft} Woche${weeksLeft === 1 ? '' : 'n'}!`
    showBuy = true
  }

  const Icon = icon

  return (
    <div className={`rounded-xl border border-gray-100 p-4 ${bgColor}`}>
      <div className="flex items-start gap-3">
        <Icon size={18} className={`mt-0.5 shrink-0 ${color}`} />
        <div className="space-y-2">
          <p className={`text-sm font-medium ${color}`}>{text}</p>
          {weeklyBurn > 0 && (
            <p className="text-xs text-gray-400">
              Ø {Math.round(weeklyBurn)} Credits/Woche verbraucht
            </p>
          )}
          {showBuy && (
            <button className="inline-flex items-center gap-1 text-xs font-medium bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors">
              <ShoppingCart size={12} /> Credits kaufen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
