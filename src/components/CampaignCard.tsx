import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, ExternalLink, CalendarPlus, Pause, FileEdit, Lightbulb, Users } from 'lucide-react'
import { PieChart, Pie, Cell } from 'recharts'
import SetupStepper from './SetupStepper'
import CampaignAssets from './CampaignAssets'
import ChangeRequestModal from './ChangeRequestModal'
import { CampaignReportButton } from './ReportButton'
import { formatCurrency, formatNumber, formatPercent, formatDate, daysRemaining } from '../lib/format'
import type { JobCampaign } from '../pages/Campaigns'

interface Props {
  campaign: JobCampaign
  defaultOpen?: boolean
  dateFrom: string
  dateTo: string
}

const subTabs = ['KPIs', 'Bewerber', 'Anzeigen', 'Aktionen'] as const
type SubTab = typeof subTabs[number]

const statusDotColor: Record<string, string> = {
  aktiv: 'bg-emerald-500',
  active: 'bg-emerald-500',
  paused: 'bg-red-400',
  pausiert: 'bg-red-400',
  ended: 'bg-gray-400',
  beendet: 'bg-gray-400',
  draft: 'bg-amber-400',
  entwurf: 'bg-amber-400',
  setup: 'bg-amber-400',
  review: 'bg-amber-400',
}

export default function CampaignCard({ campaign: c, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const [subTab, setSubTab] = useState<SubTab>('KPIs')
  const [changeModalOpen, setChangeModalOpen] = useState(false)
  const [, setSearchParams] = useSearchParams()
  const days = daysRemaining(c.end_date)

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

  const dot = statusDotColor[c.status.toLowerCase()] || 'bg-gray-400'

  return (
    <>
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
        {/* Collapsed Header */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full px-5 py-4 text-left hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${dot} shrink-0`} />
            <span className="font-medium text-gray-900 text-sm">{c.jobtitel}</span>
            <span className="text-xs text-gray-400 capitalize">{c.status}</span>
            <div className="flex-1" />
            {c.start_date && c.end_date && (
              <span className="text-xs text-gray-400 hidden sm:inline">
                {formatDate(c.start_date)} – {formatDate(c.end_date)}
              </span>
            )}
            {days !== null && days > 0 && days <= 7 && (
              <span className="text-xs font-medium text-red-500">Noch {days} {days === 1 ? 'Tag' : 'Tage'}</span>
            )}
            <span className="text-xs font-medium text-gray-600">{formatNumber(c.total_leads)} Leads</span>
            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Expanded Detail */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="border-t border-gray-100">
            {/* Setup Stepper */}
            <div className="px-5 pt-4">
              <SetupStepper campaign={c} />
            </div>

            {/* Sub-tab navigation */}
            <div className="flex gap-1 px-5 pt-3 border-b border-gray-100">
              {subTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setSubTab(tab)}
                  className={`px-3 py-2 text-xs font-medium transition-colors ${
                    subTab === tab
                      ? 'text-[#3572E8] border-b-2 border-[#3572E8] -mb-px'
                      : 'text-gray-400 hover:text-gray-600'
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
                  {/* Primary metrics */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <MetricCard label="Bewerbungen" value={formatNumber(c.total_leads)} />
                    <MetricCard label="Qualifiziert" value={formatNumber(c.qualified_leads)} />
                    <MetricCard label="CPL" value={formatCurrency(c.cpl)} />
                    <MetricCard label="CPQL" value={formatCurrency(c.cpql)} />
                  </div>

                  {/* Budget pie */}
                  {pieData && budgetTotal && (
                    <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                      <PieChart width={80} height={80}>
                        <Pie data={pieData} dataKey="value" cx={36} cy={36} innerRadius={24} outerRadius={34} startAngle={90} endAngle={-270} strokeWidth={0}>
                          <Cell fill="#3572E8" />
                          <Cell fill="#E5E7EB" />
                        </Pie>
                      </PieChart>
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900">{formatCurrency(c.total_spend)} <span className="font-normal text-gray-400">von {formatCurrency(budgetTotal)}</span></p>
                        <p className="text-xs text-gray-400 mt-0.5">{spentPct?.toFixed(0)} % verbraucht</p>
                      </div>
                    </div>
                  )}

                  {/* Detail metrics */}
                  <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 text-center">
                    <DetailMetric label="Impressionen" value={formatNumber(c.impressions)} />
                    <DetailMetric label="Reichweite" value={formatNumber(c.reach || 0)} />
                    <DetailMetric label="Klicks" value={formatNumber(c.clicks)} />
                    <DetailMetric label="CTR" value={formatPercent(c.ctr)} />
                    <DetailMetric label="CVR" value={formatPercent(c.cvr)} />
                    <DetailMetric label="CPM" value={formatCurrency(c.cpm || 0)} />
                  </div>

                  {c.notes && (
                    <div className="flex items-start gap-2 bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                      <Lightbulb size={16} className="text-[#3572E8] mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-600">{c.notes}</p>
                    </div>
                  )}

                  {c.kpi_updated_at && <p className="text-xs text-gray-400">Stand: {formatDate(c.kpi_updated_at)}</p>}
                </div>
              )}

              {/* Bewerber sub-tab */}
              {subTab === 'Bewerber' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                    <Users size={18} className="text-[#3572E8]" />
                    <div className="text-sm">
                      <span className="font-semibold text-gray-900">{formatNumber(c.total_leads)} Bewerbungen</span>
                      <span className="text-gray-400">, {formatNumber(c.qualified_leads)} qualifiziert</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSearchParams({ tab: 'applicants' })}
                    className="text-sm font-medium text-[#3572E8] hover:underline flex items-center gap-1"
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
                      className="inline-flex items-center gap-1.5 text-xs font-medium border border-gray-200 text-gray-700 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                    >
                      <CalendarPlus size={14} /> Verlängern
                    </a>
                    <a
                      href={mailto(`Kampagne pausieren: ${c.jobtitel}`)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium border border-gray-200 text-gray-700 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                    >
                      <Pause size={14} /> Pausieren
                    </a>
                    <button
                      onClick={() => setChangeModalOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium border border-gray-200 text-gray-700 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                    >
                      <FileEdit size={14} /> Änderung anfragen
                    </button>
                    <CampaignReportButton campaign={c} />
                  </div>
                  {c.funnel_url && (
                    <a href={c.funnel_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#3572E8] hover:underline">
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

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  )
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-2">
      <p className="text-[10px] text-gray-400">{label}</p>
      <p className="text-xs font-medium text-gray-700">{value}</p>
    </div>
  )
}
