import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, ExternalLink, CalendarPlus, Pause, FileEdit, Lightbulb, Users } from 'lucide-react'
import { PieChart, Pie, Cell } from 'recharts'
import StatusBadge from './StatusBadge'
import SetupStepper from './SetupStepper'
import CampaignAssets from './CampaignAssets'
import ChangeRequestModal from './ChangeRequestModal'
import { CampaignReportButton } from './ReportButton'
import { formatCurrency, formatNumber, formatPercent, formatDate, daysRemaining } from '../lib/format'
import type { JobCampaign } from '../pages/Campaigns'

interface Props {
  campaign: JobCampaign
  defaultOpen?: boolean
}

const subTabs = ['KPIs', 'Bewerber', 'Anzeigen', 'Aktionen'] as const
type SubTab = typeof subTabs[number]

function countdownBadge(days: number | null) {
  if (days === null || days <= 0) return null
  const cls = days <= 1 ? 'bg-red-100 text-red-700'
    : days < 7 ? 'bg-red-50 text-red-600'
    : days <= 14 ? 'bg-amber-50 text-amber-600'
    : 'bg-emerald-50 text-emerald-600'
  const text = days <= 1 ? 'Endet morgen!' : `Noch ${days} Tage`
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>{text}</span>
}

function progressPercent(start: string | null, end: string | null): number | null {
  if (!start || !end) return null
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (e <= s) return 100
  return Math.min(100, Math.max(0, ((Date.now() - s) / (e - s)) * 100))
}

export default function CampaignCard({ campaign: c, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const [subTab, setSubTab] = useState<SubTab>('KPIs')
  const [changeModalOpen, setChangeModalOpen] = useState(false)
  const [, setSearchParams] = useSearchParams()
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
    <>
      <div className="rounded-2xl border border-card-border bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full p-5 text-left hover:bg-content-bg/50 transition-colors"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{c.jobtitel}</span>
            <StatusBadge status={c.status} />
            {c.funnel_status && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-kpi-purple text-purple-700">{c.funnel_status}</span>
            )}
            <div className="flex-1" />
            {countdownBadge(days)}
            <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </div>
          {progress !== null && (
            <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
          {/* Compact summary always visible */}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>{formatNumber(c.total_leads)} Bewerbungen</span>
            <span className="text-amber-600 font-medium">{formatNumber(c.qualified_leads)} qualifiziert</span>
            {c.total_spend > 0 && <span>{formatCurrency(c.total_spend)} ausgegeben</span>}
          </div>
        </button>

        {/* Detail — with sub-tabs */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="border-t border-card-border">
            {/* Setup Stepper */}
            <div className="px-5 pt-4">
              <SetupStepper campaign={c} />
            </div>

            {/* Sub-tab navigation */}
            <div className="flex gap-1 px-5 pt-3 border-b border-card-border">
              {subTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setSubTab(tab)}
                  className={`px-3 py-2 text-xs font-medium transition-colors ${
                    subTab === tab
                      ? 'text-accent border-b-2 border-accent -mb-px'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="px-5 py-4">
              {/* KPIs sub-tab */}
              {subTab === 'KPIs' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <MiniKPI label="Bewerbungen" value={formatNumber(c.total_leads)} tint="bg-kpi-purple" />
                    <MiniKPI label="Qualifiziert" value={formatNumber(c.qualified_leads)} tint="bg-kpi-gold" />
                    <MiniKPI label="CPL" value={formatCurrency(c.cpl)} tint="bg-kpi-peach" />
                    <MiniKPI label="CPQL" value={formatCurrency(c.cpql)} tint="bg-kpi-blue" />
                  </div>

                  {pieData && budgetTotal && (
                    <div className="flex items-center gap-4 bg-content-bg rounded-2xl p-4">
                      <PieChart width={100} height={100}>
                        <Pie data={pieData} dataKey="value" cx={45} cy={45} innerRadius={30} outerRadius={42} startAngle={90} endAngle={-270}>
                          <Cell fill="#3572E8" />
                          <Cell fill="#E8E8EF" />
                        </Pie>
                      </PieChart>
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900">{formatCurrency(c.total_spend)} <span className="font-normal text-gray-500">von {formatCurrency(budgetTotal)}</span></p>
                        <p className="text-xs text-gray-500 mt-1">{spentPct?.toFixed(0)}% verbraucht</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 text-center">
                    <Detail label="Impressionen" value={formatNumber(c.impressions)} />
                    <Detail label="Reichweite" value={formatNumber(c.reach || 0)} />
                    <Detail label="Klicks" value={formatNumber(c.clicks)} />
                    <Detail label="CTR" value={formatPercent(c.ctr)} />
                    <Detail label="CVR" value={formatPercent(c.cvr)} />
                    <Detail label="CPM" value={formatCurrency(c.cpm || 0)} />
                  </div>

                  {c.notes && (
                    <div className="flex items-start gap-2 bg-kpi-blue rounded-2xl p-4">
                      <Lightbulb size={16} className="text-accent mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-700">Empfehlung: {c.notes}</p>
                    </div>
                  )}

                  {c.kpi_updated_at && <p className="text-xs text-gray-400">Stand: {formatDate(c.kpi_updated_at)}</p>}
                </div>
              )}

              {/* Bewerber sub-tab — compact summary + link */}
              {subTab === 'Bewerber' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-content-bg rounded-2xl p-4">
                    <Users size={18} className="text-accent" />
                    <div className="text-sm">
                      <span className="font-semibold text-gray-900">{formatNumber(c.total_leads)} Bewerbungen</span>
                      <span className="text-gray-500">, {formatNumber(c.qualified_leads)} qualifiziert</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSearchParams({ tab: 'applicants' })}
                    className="text-sm font-medium text-accent hover:underline flex items-center gap-1"
                  >
                    Alle Bewerber ansehen →
                  </button>
                </div>
              )}

              {/* Anzeigen sub-tab */}
              {subTab === 'Anzeigen' && (
                <CampaignAssets
                  creativeUrls={c.creative_urls}
                  headline={c.anzeigen_headline}
                  primaryText={c.anzeigentext_primaer}
                  cta={c.anzeigen_cta}
                />
              )}

              {/* Aktionen sub-tab */}
              {subTab === 'Aktionen' && (
                <div className="space-y-3">
                  <div className="flex items-center flex-wrap gap-2">
                    <a
                      href={mailto(`Kampagne verlängern: ${c.jobtitel}`)}
                      className="inline-flex items-center gap-1 text-xs font-medium border border-accent text-accent rounded-lg px-3 py-1.5 hover:bg-accent/5 transition-colors"
                    >
                      <CalendarPlus size={14} /> Verlängern
                    </a>
                    <a
                      href={mailto(`Kampagne pausieren: ${c.jobtitel}`)}
                      className="inline-flex items-center gap-1 text-xs font-medium border border-amber-400 text-amber-600 rounded-lg px-3 py-1.5 hover:bg-amber-50 transition-colors"
                    >
                      <Pause size={14} /> Pausieren
                    </a>
                    <button
                      onClick={() => setChangeModalOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-medium border border-purple-400 text-purple-600 rounded-lg px-3 py-1.5 hover:bg-purple-50 transition-colors"
                    >
                      <FileEdit size={14} /> Änderung anfragen
                    </button>
                    <CampaignReportButton campaign={c} />
                  </div>
                  {c.funnel_url && (
                    <a href={c.funnel_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-accent hover:underline">
                      Funnel öffnen <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {changeModalOpen && (
        <ChangeRequestModal
          campaignId={c.id}
          campaignTitle={c.jobtitel}
          onClose={() => setChangeModalOpen(false)}
        />
      )}
    </>
  )
}

function MiniKPI({ label, value, tint }: { label: string; value: string; tint?: string }) {
  return (
    <div className={`rounded-xl p-3 text-center ${tint || 'bg-content-bg'}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-content-bg p-2">
      <p className="text-[10px] text-gray-400">{label}</p>
      <p className="text-xs font-medium text-gray-700">{value}</p>
    </div>
  )
}
