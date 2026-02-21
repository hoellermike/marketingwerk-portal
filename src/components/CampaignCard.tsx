import { useState } from 'react'
import { ChevronDown, ExternalLink } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { formatCurrency, formatNumber, formatPercent, formatDate, daysRemaining } from '../lib/format'
import type { JobCampaign } from '../pages/Campaigns'

interface Props {
  campaign: JobCampaign
  defaultOpen?: boolean
}

export default function CampaignCard({ campaign: c, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const days = daysRemaining(c.end_date)
  const budgetSpent = c.daily_budget && c.start_date && c.end_date
    ? (() => {
        const totalBudget = c.daily_budget * Math.ceil((new Date(c.end_date!).getTime() - new Date(c.start_date!).getTime()) / 86400000)
        return Math.min((c.total_spend / totalBudget) * 100, 100)
      })()
    : null

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{c.jobtitel}</span>
            <StatusBadge status={c.status} />
            {c.funnel_status && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">{c.funnel_status}</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {c.start_date && c.end_date ? `${formatDate(c.start_date)} – ${formatDate(c.end_date)}` : ''}
            {days !== null && days > 0 ? ` · ${days} Tage verbleibend` : ''}
          </p>
        </div>
        <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
          {budgetSpent !== null && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Budget verbraucht</span>
                <span>{budgetSpent.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${budgetSpent}%` }} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MiniKPI label="Ausgaben" value={formatCurrency(c.total_spend)} />
            <MiniKPI label="Impressions" value={formatNumber(c.impressions)} />
            <MiniKPI label="Bewerbungen" value={formatNumber(c.total_leads)} />
            <MiniKPI label="Qualifiziert" value={formatNumber(c.qualified_leads)} highlighted />
          </div>

          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 text-center">
            <Detail label="Clicks" value={formatNumber(c.clicks)} />
            <Detail label="CTR" value={formatPercent(c.ctr)} />
            <Detail label="CVR" value={formatPercent(c.cvr)} />
            <Detail label="CPL" value={formatCurrency(c.cpl)} />
            <Detail label="CPQL" value={formatCurrency(c.cpql)} />
            <Detail label="Budget/Tag" value={c.daily_budget ? formatCurrency(c.daily_budget) : '–'} />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
            {c.funnel_url ? (
              <a href={c.funnel_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-accent hover:underline">
                Funnel öffnen <ExternalLink size={12} />
              </a>
            ) : <span />}
            {c.kpi_updated_at && <span>Stand: {formatDate(c.kpi_updated_at)}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniKPI({ label, value, highlighted }: { label: string; value: string; highlighted?: boolean }) {
  return (
    <div className={`rounded-lg p-3 text-center ${highlighted ? 'bg-gold/10 border border-gold/30' : 'bg-gray-50'}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-bold text-gray-900">{value}</p>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-2">
      <p className="text-[10px] text-gray-400">{label}</p>
      <p className="text-xs font-medium text-gray-700">{value}</p>
    </div>
  )
}
