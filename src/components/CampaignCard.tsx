import { useState } from 'react'
import { ChevronDown, ExternalLink, CalendarPlus, Pause, Lightbulb } from 'lucide-react'
import { PieChart, Pie, Cell } from 'recharts'
import StatusBadge from './StatusBadge'
import { formatCurrency, formatNumber, formatPercent, formatDate, daysRemaining } from '../lib/format'
import type { JobCampaign } from '../pages/Campaigns'

interface Props {
  campaign: JobCampaign
  defaultOpen?: boolean
}

function countdownBadge(days: number | null) {
  if (days === null || days <= 0) return null
  let text: string
  let cls: string
  if (days <= 1) {
    text = 'Endet morgen!'
    cls = 'bg-red-200 text-red-900'
  } else if (days < 7) {
    text = `Noch ${days} Tage`
    cls = 'bg-red-100 text-red-700'
  } else if (days <= 14) {
    text = `Noch ${days} Tage`
    cls = 'bg-yellow-100 text-yellow-700'
  } else {
    text = `Noch ${days} Tage`
    cls = 'bg-green-100 text-green-700'
  }
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>{text}</span>
}

function progressPercent(start: string | null, end: string | null): number | null {
  if (!start || !end) return null
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  const now = Date.now()
  if (e <= s) return 100
  return Math.min(100, Math.max(0, ((now - s) / (e - s)) * 100))
}

export default function CampaignCard({ campaign: c, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const days = daysRemaining(c.end_date)
  const progress = progressPercent(c.start_date, c.end_date)

  const budgetTotal = c.budget_total
  const spentPct = budgetTotal && budgetTotal > 0 ? Math.min((c.total_spend / budgetTotal) * 100, 100) : null
  const pieData = budgetTotal && budgetTotal > 0
    ? [
        { name: 'Ausgegeben', value: c.total_spend },
        { name: 'Verbleibend', value: Math.max(0, budgetTotal - c.total_spend) },
      ]
    : null

  const mailto = (subject: string) =>
    `mailto:office@marketingwerk.at?subject=${encodeURIComponent(subject)}`

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm">{c.jobtitel}</span>
          <StatusBadge status={c.status} />
          {c.funnel_status && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">{c.funnel_status}</span>
          )}
          <div className="flex-1" />
          {countdownBadge(days)}
          <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
        {progress !== null && (
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
      </button>

      {/* Detail */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${open ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
          {/* KPI Cards 2×3 */}
          <div className="grid grid-cols-3 gap-3">
            <MiniKPI label="Impressionen" value={formatNumber(c.impressions)} />
            <MiniKPI label="Reichweite" value={formatNumber(c.reach || 0)} />
            <MiniKPI label="Link-Klicks" value={formatNumber(c.link_clicks || 0)} />
            <MiniKPI label="Bewerbungen" value={formatNumber(c.total_leads)} />
            <MiniKPI label="Qualifizierte Leads" value={formatNumber(c.qualified_leads)} highlighted />
            <MiniKPI label="CPM" value={formatCurrency(c.cpm || 0)} />
          </div>

          {/* Budget Pie */}
          {pieData && budgetTotal && (
            <div className="flex items-center gap-4">
              <PieChart width={120} height={120}>
                <Pie data={pieData} dataKey="value" cx={55} cy={55} innerRadius={35} outerRadius={50} startAngle={90} endAngle={-270}>
                  <Cell fill="#3572E8" />
                  <Cell fill="#E5E7EB" />
                </Pie>
              </PieChart>
              <div className="text-sm">
                <p className="font-semibold text-gray-900">{formatCurrency(c.total_spend)} <span className="font-normal text-gray-500">von {formatCurrency(budgetTotal)}</span></p>
                <p className="text-xs text-gray-500">{spentPct?.toFixed(0)}% verbraucht</p>
              </div>
            </div>
          )}

          {/* Detail row */}
          <div className="grid grid-cols-3 lg:grid-cols-7 gap-2 text-center">
            <Detail label="Budget/Tag" value={c.daily_budget ? formatCurrency(c.daily_budget) : '–'} />
            <Detail label="Gesamtausgaben" value={formatCurrency(c.total_spend)} />
            <Detail label="Clicks" value={formatNumber(c.clicks)} />
            <Detail label="CTR" value={formatPercent(c.ctr)} />
            <Detail label="CVR" value={formatPercent(c.cvr)} />
            <Detail label="CPL" value={formatCurrency(c.cpl)} />
            <Detail label="CPQL" value={formatCurrency(c.cpql)} />
          </div>

          {/* Notes */}
          {c.notes && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg p-3">
              <Lightbulb size={16} className="text-accent mt-0.5 shrink-0" />
              <p className="text-sm text-gray-700">Empfehlung: {c.notes}</p>
            </div>
          )}

          {/* Action Buttons + Funnel + Stand */}
          <div className="flex items-center flex-wrap gap-2 pt-1">
            <a
              href={mailto(`Kampagne verlängern: ${c.jobtitel}`)}
              className="inline-flex items-center gap-1 text-xs font-medium border border-accent text-accent rounded-lg px-3 py-1.5 hover:bg-accent/5 transition-colors"
            >
              <CalendarPlus size={14} /> Verlängern
            </a>
            <a
              href={mailto(`Kampagne pausieren: ${c.jobtitel}`)}
              className="inline-flex items-center gap-1 text-xs font-medium border border-yellow-400 text-yellow-600 rounded-lg px-3 py-1.5 hover:bg-yellow-50 transition-colors"
            >
              <Pause size={14} /> Pausieren
            </a>
            <div className="flex-1" />
            {c.funnel_url && (
              <a href={c.funnel_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-accent hover:underline">
                Funnel öffnen <ExternalLink size={12} />
              </a>
            )}
            {c.kpi_updated_at && <span className="text-xs text-gray-400">Stand: {formatDate(c.kpi_updated_at)}</span>}
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
