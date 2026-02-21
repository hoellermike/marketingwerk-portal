import { useEffect, useMemo, useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import CampaignCard from '../components/CampaignCard'
import { formatDate } from '../lib/format'
import BriefingWizard from '../components/BriefingWizard'
import CampaignCalendar from '../components/CampaignCalendar'
import { Plus, List, Calendar } from 'lucide-react'

export interface JobCampaign {
  id: string
  client_id: string
  jobtitel: string
  status: string
  funnel_status: string | null
  funnel_url: string | null
  start_date: string | null
  end_date: string | null
  daily_budget: number | null
  total_spend: number
  impressions: number
  clicks: number
  total_leads: number
  qualified_leads: number
  ctr: number
  cvr: number
  cpl: number
  cpql: number
  kpi_updated_at: string | null
  reach: number
  link_clicks: number
  cpm: number
  budget_total: number | null
  notes: string | null
  setup_phase: string | null
  creative_urls: string[] | null
  anzeigentext_primaer: string | null
  anzeigen_headline: string | null
  anzeigen_cta: string | null
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

const statusConfig: { key: string; label: string; match: (s: string) => boolean; color: string }[] = [
  { key: 'aktiv', label: 'Aktiv', match: s => ['aktiv', 'active'].includes(s), color: 'bg-emerald-500' },
  { key: 'vorbereitung', label: 'In Vorbereitung', match: s => ['setup', 'draft', 'entwurf', 'review'].includes(s), color: 'bg-amber-400' },
  { key: 'abgeschlossen', label: 'Abgeschlossen', match: s => ['ended', 'beendet'].includes(s), color: 'bg-gray-400' },
  { key: 'pausiert', label: 'Pausiert', match: s => ['paused', 'pausiert'].includes(s), color: 'bg-red-400' },
]

export default function Campaigns() {
  const { client } = useAuth()
  const [campaigns, setCampaigns] = useState<JobCampaign[]>([])
  const [showWizard, setShowWizard] = useState(false)
  const [view, setView] = useState<'list' | 'calendar'>('list')

  const fetchCampaigns = useCallback(() => {
    if (!client) return
    supabase
      .from('job_campaigns')
      .select('*')
      .eq('client_id', client.id)
      .order('start_date', { ascending: false })
      .then(({ data }) => setCampaigns(data || []))
  }, [client])

  const defaultFrom = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return toISODate(d)
  }, [])
  const defaultTo = useMemo(() => toISODate(new Date()), [])

  const [dateFrom, setDateFrom] = useState(defaultFrom)
  const [dateTo, setDateTo] = useState(defaultTo)

  useEffect(() => { fetchCampaigns() }, [fetchCampaigns])

  // Count campaigns by status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { aktiv: 0, vorbereitung: 0, abgeschlossen: 0, pausiert: 0 }
    for (const c of campaigns) {
      const s = c.status.toLowerCase()
      for (const sc of statusConfig) {
        if (sc.match(s)) { counts[sc.key]++; break }
      }
    }
    return counts
  }, [campaigns])

  return (
    <div className="space-y-6">
      {showWizard && <BriefingWizard onClose={() => { setShowWizard(false); fetchCampaigns() }} pastCampaigns={campaigns.map(c => ({ id: c.id, jobtitel: c.jobtitel }))} />}

      {/* Header + Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kampagnen</h1>
            <p className="text-sm text-gray-500 mt-1">Übersicht Ihrer Kampagnen</p>
          </div>
          <button onClick={() => setShowWizard(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[#3572E8] text-white rounded-lg text-sm font-medium hover:bg-[#2860d0] transition-colors">
            <Plus size={16} /> Neue Kampagne anfragen
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setView('list')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${view === 'list' ? 'bg-[#3572E8] text-white' : 'text-gray-600'}`}><List size={14} /> Liste</button>
            <button onClick={() => setView('calendar')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${view === 'calendar' ? 'bg-[#3572E8] text-white' : 'text-gray-600'}`}><Calendar size={14} /> Kalender</button>
          </div>
          <div className="flex items-center gap-2 text-sm">
          <label className="text-gray-500">Von</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#3572E8]/20 focus:border-[#3572E8]"
          />
          <label className="text-gray-500">Bis</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#3572E8]/20 focus:border-[#3572E8]"
          />
        </div>
        </div>
      </div>

      {view === 'calendar' ? (
        <CampaignCalendar campaigns={campaigns} onRefresh={fetchCampaigns} />
      ) : (<>
      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statusConfig.map(sc => (
          <div key={sc.key} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${sc.color} shrink-0`} />
            <div>
              <p className="text-xl font-semibold text-gray-900">{statusCounts[sc.key]}</p>
              <p className="text-xs text-gray-500">{sc.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign List */}
      <div className="space-y-3">
        {campaigns.map((c, i) => (
          <CampaignCard key={c.id} campaign={c} defaultOpen={i === 0} dateFrom={dateFrom} dateTo={dateTo} />
        ))}
        {campaigns.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-12">Keine Kampagnen vorhanden.</p>
        )}
      </div>
      </>)}
    </div>
  )
}
