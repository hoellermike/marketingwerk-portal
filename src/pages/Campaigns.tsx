import { useEffect, useMemo, useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import CampaignCard from '../components/CampaignCard'
import { formatDate, formatCurrency, formatNumber } from '../lib/format'
import { exportData, formatDateExport } from '../lib/export'
import ExportModal from '../components/ExportModal'
import BriefingWizard from '../components/BriefingWizard'
import CampaignCalendar from '../components/CampaignCalendar'
import { Plus, List, Calendar, Download, Megaphone, FileEdit, Trash2 } from 'lucide-react'
import { SkeletonStatusCards, SkeletonCard } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import { useToast } from '../contexts/ToastContext'

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
  const [wizardDraftId, setWizardDraftId] = useState<string | undefined>(undefined)
  const [wizardPrefill, setWizardPrefill] = useState<Record<string, any> | undefined>(undefined)
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [showExport, setShowExport] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const { showToast } = useToast()

  const handleExport = (format: 'xlsx' | 'csv') => {
    const headers: Record<string, string> = {
      jobtitel: 'Kampagne',
      status: 'Status',
      start_date: 'Start',
      end_date: 'Ende',
      total_leads: 'Bewerbungen',
      qualified_leads: 'Qualifiziert',
      total_spend: 'Ausgaben (€)',
      cpl: 'CPL (€)',
      cpql: 'CPQL (€)',
    }
    const rows = campaigns.map(c => ({
      ...c,
      start_date: formatDateExport(c.start_date),
      end_date: formatDateExport(c.end_date),
    }))
    const today = new Date().toISOString().slice(0, 10)
    exportData(rows, headers, {
      filename: `${client?.company_name || 'Export'}_Kampagnen_${today}.${format}`,
      sheetName: 'Kampagnen',
      format,
    })
  }

  const fetchCampaigns = useCallback(() => {
    if (!client) return
    setLoading(true)
    supabase
      .from('job_campaigns')
      .select('*')
      .eq('client_id', client.id)
      .order('start_date', { ascending: false })
      .then(({ data, error }) => { if (error) showToast('Fehler beim Laden der Kampagnen', 'error'); setCampaigns(data || []) })
      .finally(() => setLoading(false))
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

  // Drafts
  const drafts = useMemo(() => campaigns.filter(c => (c as any).briefing_status === 'entwurf'), [campaigns])

  const openWizardForDraft = (draftId: string) => {
    setWizardDraftId(draftId)
    setWizardPrefill(undefined)
    setShowWizard(true)
  }

  const openWizardFresh = () => {
    setWizardDraftId(undefined)
    setWizardPrefill(undefined)
    setShowWizard(true)
  }

  const openWizardWithPrefill = (prefill: Record<string, any>) => {
    setWizardDraftId(undefined)
    setWizardPrefill(prefill)
    setShowWizard(true)
  }

  const handleDeleteDraft = async (id: string) => {
    await supabase.from('job_campaigns').delete().eq('id', id)
    showToast('Entwurf gelöscht')
    setDeleteConfirm(null)
    fetchCampaigns()
  }

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
      {showWizard && <BriefingWizard onClose={() => { setShowWizard(false); setWizardDraftId(undefined); setWizardPrefill(undefined); fetchCampaigns() }} pastCampaigns={campaigns.map(c => ({ id: c.id, jobtitel: c.jobtitel }))} draftId={wizardDraftId} prefill={wizardPrefill as any} />}

      {/* Header + Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kampagnen</h1>
            <p className="text-sm text-gray-500 mt-1">Übersicht Ihrer Kampagnen</p>
          </div>
          <button onClick={openWizardFresh} className="flex items-center gap-1.5 px-4 py-2 bg-[#3572E8] text-white rounded-lg text-sm font-medium hover:bg-[#2860d0] transition-colors">
            <Plus size={16} /> Neue Kampagne anfragen
          </button>
          <button onClick={() => setShowExport(true)} className="flex items-center gap-1.5 text-xs font-medium border border-gray-200 text-gray-700 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
            <Download size={14} /> Exportieren
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

      {loading ? (
        <>
          <SkeletonStatusCards count={4} />
          <SkeletonCard lines={4} />
          <SkeletonCard lines={4} />
        </>
      ) : view === 'calendar' ? (
        <CampaignCalendar campaigns={campaigns} onRefresh={fetchCampaigns} onOpenBriefing={(jobtitel, start, end) => openWizardWithPrefill({ jobtitel, kampagnenstart: start || '', ...(end ? {} : {}) })} />
      ) : (<>
      {/* Drafts Section */}
      {drafts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileEdit size={18} className="text-[#3572E8]" />
            <h2 className="text-lg font-semibold text-gray-900">Entwürfe</h2>
          </div>
          <div className="space-y-2">
            {drafts.map(d => (
              <div key={d.id} className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{d.jobtitel} — <span className="text-gray-400">Entwurf</span></p>
                  {d.kpi_updated_at && <p className="text-xs text-gray-400 mt-0.5">Zuletzt bearbeitet: {formatDate(d.kpi_updated_at)}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openWizardForDraft(d.id)}
                    className="text-sm font-medium text-[#3572E8] hover:underline flex items-center gap-1">
                    Fortsetzen →
                  </button>
                  <button onClick={() => setDeleteConfirm(d.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          <EmptyState icon={Megaphone} title="Noch keine Kampagnen" description="Erstellen Sie Ihre erste Kampagne, um Bewerber zu gewinnen." action={{ label: 'Neue Kampagne anfragen', onClick: () => setShowWizard(true) }} />
        )}
      </div>
      </>)}

      {showExport && (
        <ExportModal
          onClose={() => setShowExport(false)}
          onExport={handleExport}
          title="Kampagnen exportieren"
        />
      )}

      {deleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setDeleteConfirm(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-xl w-full max-w-sm p-6">
              <h3 className="text-base font-bold text-gray-900 mb-2">Entwurf löschen?</h3>
              <p className="text-sm text-gray-500 mb-5">Dieser Entwurf wird unwiderruflich gelöscht.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">Abbrechen</button>
                <button onClick={() => handleDeleteDraft(deleteConfirm)} className="flex-1 px-4 py-2.5 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium">Löschen</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
