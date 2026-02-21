import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Users, ClipboardCheck, Award, AlertTriangle, UserCheck, Star, Search, ChevronRight, Inbox, Link2, Download, X, FolderOpen } from 'lucide-react'
import { SkeletonKPI, SkeletonTable } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import { useToast } from '../contexts/ToastContext'
import { mapStatus, filterChips, isInPruefung, isQualifiziert, needsFeedback } from '../lib/statusMap'
import { formatDate, formatNumber } from '../lib/format'
import { exportData, formatDateExport } from '../lib/export'
import KPICard from '../components/KPICard'
import ExportModal from '../components/ExportModal'
import ApplicantDetail, { type ApplicationDetail } from '../components/ApplicantDetail'

export default function Applicants() {
  const { client } = useAuth()
  const [applications, setApplications] = useState<ApplicationDetail[]>([])
  const [campaigns, setCampaigns] = useState<{ id: string; jobtitel: string }[]>([])
  const [loading, setLoading] = useState(true)

  // View mode
  const [view, setView] = useState<'active' | 'pool'>('active')

  // Filters
  const [statusFilter, setStatusFilter] = useState('Alle')
  const [campaignFilter, setCampaignFilter] = useState('')
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('')

  // Detail panel
  const [selected, setSelected] = useState<ApplicationDetail | null>(null)

  // Export modal
  const [showExport, setShowExport] = useState(false)

  const { showToast } = useToast()

  // Suggest modal
  const [suggestApp, setSuggestApp] = useState<ApplicationDetail | null>(null)
  const [suggestCampaign, setSuggestCampaign] = useState('')
  const [suggestNote, setSuggestNote] = useState('')
  const [suggestToast, setSuggestToast] = useState(false)

  // Reject modal
  const [rejectApp, setRejectApp] = useState<ApplicationDetail | null>(null)
  const [rejectChoice, setRejectChoice] = useState<'reject' | 'pool'>('reject')
  const [poolReason, setPoolReason] = useState('')
  const [poolTags, setPoolTags] = useState('')

  const fetchData = () => {
    if (!client) return
    supabase
      .from('applications')
      .select('*, job_campaigns(jobtitel)')
      .eq('client_id', client.id)
      .eq('sichtbar_fuer_kunde', true)
      .order('bewerbungsdatum', { ascending: false })
      .then(({ data, error }) => {
        if (error) showToast('Fehler beim Laden der Bewerber', 'error')
        setApplications((data as ApplicationDetail[]) || [])
        setLoading(false)
      })

    supabase
      .from('job_campaigns')
      .select('id, jobtitel')
      .eq('client_id', client.id)
      .then(({ data }) => setCampaigns(data || []))
  }

  useEffect(() => { fetchData() }, [client])

  if (!client) return null

  const activeApps = applications.filter(a => !a.is_talent_pool)
  const poolApps = applications.filter(a => a.is_talent_pool)
  const currentApps = view === 'active' ? activeApps : poolApps

  // KPI counts (active only)
  const total = activeApps.length
  const inPruefung = activeApps.filter(a => isInPruefung(a.status)).length
  const qualifiziert = activeApps.filter(a => isQualifiziert(a.status)).length
  const feedbackOffen = activeApps.filter(a => needsFeedback(a.status, a.feedback_datum)).length
  const eingestellt = activeApps.filter(a => a.status === 'Eingestellt').length

  // Filter logic
  const filtered = currentApps.filter(a => {
    if (view === 'active') {
      const status = mapStatus(a.status)
      if (statusFilter !== 'Alle' && status.label !== statusFilter) return false
    }
    if (campaignFilter && a.job_campaigns?.jobtitel !== campaignFilter) return false
    if (tagFilter && !(a.tags || []).includes(tagFilter)) return false
    if (search) {
      const q = search.toLowerCase()
      const nameMatch = (a.vorname || '').toLowerCase().includes(q)
      const profileMatch = (a.berufserfahrung_kurz || '').toLowerCase().includes(q)
      if (!nameMatch && !profileMatch) return false
    }
    return true
  })

  // Chip counts
  const chipCounts: Record<string, number> = { Alle: activeApps.length }
  activeApps.forEach(a => {
    const label = mapStatus(a.status).label
    chipCounts[label] = (chipCounts[label] || 0) + 1
  })

  // All tags from pool
  const allTags = [...new Set(poolApps.flatMap(a => a.tags || []))]

  const handleExport = (format: 'xlsx' | 'csv', hideContacts?: boolean) => {
    const headers: Record<string, string> = {
      vorname: 'Vorname',
      nachname_initial: 'Nachname',
      status: 'Status',
      campaign: 'Kampagne',
      bewerbungsdatum: 'Beworben am',
      qualifikations_score: 'Score',
      berufserfahrung_kurz: 'Berufserfahrung',
    }
    if (!hideContacts) {
      headers.telefon = 'Telefon'
      headers.email = 'E-Mail'
    }
    const rows = filtered.map(a => ({
      ...a,
      campaign: a.job_campaigns?.jobtitel || '',
      bewerbungsdatum: formatDateExport(a.bewerbungsdatum),
    }))
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '-')
    exportData(rows, headers, {
      filename: `${client.company_name || 'Export'}_Bewerbungen_${today}.${format}`,
      sheetName: 'Bewerbungen',
      format,
    })
  }

  const handleRejectSubmit = async () => {
    if (!rejectApp) return
    if (rejectChoice === 'pool') {
      await supabase.from('applications').update({
        is_talent_pool: true,
        talent_pool_date: new Date().toISOString(),
        talent_pool_reason: poolReason,
        tags: poolTags ? poolTags.split(',').map(t => t.trim()) : [],
      }).eq('id', rejectApp.id)
    } else {
      await supabase.from('applications').update({ status: 'Nicht passend' }).eq('id', rejectApp.id)
    }
    setRejectApp(null)
    setPoolReason('')
    setPoolTags('')
    setRejectChoice('reject')
    fetchData()
  }

  const handleSuggestSubmit = () => {
    setSuggestApp(null)
    setSuggestCampaign('')
    setSuggestNote('')
    showToast('Vorschlag gesendet')
  }

  const daysInPool = (date: string | null) => {
    if (!date) return 0
    return Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bewerber</h1>
        <p className="text-sm text-gray-500 mt-1">Alle Kandidaten im Überblick. Feedback geben und den Prozess vorantreiben.</p>
      </div>

      {/* Segment toggle */}
      <div className="flex gap-1">
        <button
          onClick={() => setView('active')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            view === 'active' ? 'bg-[#3572E8] text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Aktive Bewerber ({activeApps.length})
        </button>
        <button
          onClick={() => setView('pool')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            view === 'pool' ? 'bg-[#3572E8] text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Talent Pool ({poolApps.length})
        </button>
      </div>

      {view === 'active' && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <KPICard label="Bewerbungen gesamt" value={formatNumber(total)} icon={Users} tint="blue" />
            <KPICard label="In Prüfung" value={formatNumber(inPruefung)} icon={ClipboardCheck} tint="blue" />
            <KPICard label="Qualifiziert" value={formatNumber(qualifiziert)} icon={Award} tint="gold" />
            <KPICard label="Feedback offen" value={formatNumber(feedbackOffen)} icon={AlertTriangle} tint="peach" />
            <KPICard label="Eingestellt" value={formatNumber(eingestellt)} icon={UserCheck} tint="mint" />
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={campaignFilter}
              onChange={e => setCampaignFilter(e.target.value)}
              className="text-sm rounded-xl border border-gray-100 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#3572E8]/30"
            >
              <option value="">Alle Kampagnen</option>
              {campaigns.map(c => (
                <option key={c.id} value={c.jobtitel}>{c.jobtitel}</option>
              ))}
            </select>

            <div className="flex flex-wrap gap-1.5">
              {filterChips.map(chip => {
                const count = chipCounts[chip] || 0
                if (chip !== 'Alle' && count === 0) return null
                return (
                  <button
                    key={chip}
                    onClick={() => setStatusFilter(chip)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      statusFilter === chip
                        ? 'bg-[#3572E8] text-white border-[#3572E8]'
                        : 'border-gray-100 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {chip} ({count})
                  </button>
                )
              })}
            </div>

            <div className="relative ml-auto">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Suchen…"
                className="text-sm rounded-xl border border-gray-100 pl-8 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#3572E8]/30 w-48"
              />
            </div>

            <button
              onClick={() => setShowExport(true)}
              className="flex items-center gap-1.5 text-xs font-medium border border-gray-200 text-gray-700 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
            >
              <Download size={14} /> Exportieren
            </button>
          </div>
        </>
      )}

      {view === 'pool' && (
        <>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-lg font-semibold text-gray-900">{poolApps.length} Kandidaten im Talent Pool</h2>
            <p className="text-sm text-gray-500 mt-1">Gute Kandidaten, die aktuell nicht passen, aber für zukünftige Stellen vorgemerkt sind.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={campaignFilter}
              onChange={e => setCampaignFilter(e.target.value)}
              className="text-sm rounded-xl border border-gray-100 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#3572E8]/30"
            >
              <option value="">Alle Kampagnen</option>
              {campaigns.map(c => (
                <option key={c.id} value={c.jobtitel}>{c.jobtitel}</option>
              ))}
            </select>

            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setTagFilter('')}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    !tagFilter ? 'bg-[#3572E8] text-white border-[#3572E8]' : 'border-gray-100 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Alle Tags
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setTagFilter(tag)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      tagFilter === tag ? 'bg-[#3572E8] text-white border-[#3572E8]' : 'border-gray-100 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            <div className="relative ml-auto">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Suchen…"
                className="text-sm rounded-xl border border-gray-100 pl-8 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#3572E8]/30 w-48"
              />
            </div>

            <button
              onClick={() => setShowExport(true)}
              className="flex items-center gap-1.5 text-xs font-medium border border-gray-200 text-gray-700 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
            >
              <Download size={14} /> Exportieren
            </button>
          </div>
        </>
      )}

      {/* Table */}
      {loading ? (
        <>
          {view === 'active' && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonKPI key={i} />)}
            </div>
          )}
          <SkeletonTable rows={6} cols={5} />
        </>
      ) : filtered.length === 0 ? (
        view === 'pool' ? (
          <EmptyState icon={FolderOpen} title="Ihr Talent Pool ist noch leer" description="Verschieben Sie interessante Kandidaten hierher, um sie für zukünftige Stellen vorzumerken." />
        ) : (
          <EmptyState icon={Users} title="Noch keine Bewerber" description="Sobald Bewerbungen eingehen, sehen Sie diese hier." />
        )
      ) : view === 'active' ? (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Bewerber</th>
                <th className="px-5 py-3.5 font-medium hidden md:table-cell">Kampagne</th>
                <th className="px-5 py-3.5 font-medium hidden sm:table-cell">Beworben am</th>
                <th className="px-5 py-3.5 font-medium text-center">Score</th>
                <th className="px-5 py-3.5 font-medium text-center">Feedback</th>
                <th className="px-5 py-3.5 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(app => {
                const status = mapStatus(app.status)
                const hasPendingFeedback = needsFeedback(app.status, app.feedback_datum)
                const name = `${app.vorname || 'Bewerber'}${app.nachname_initial ? ` ${app.nachname_initial}.` : ''}`
                const isDuplicate = !!app.duplicate_of

                return (
                  <tr
                    key={app.id}
                    onClick={() => setSelected(app)}
                    className={`cursor-pointer transition-colors hover:bg-gray-50/50 ${
                      hasPendingFeedback ? 'bg-orange-50/50' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${status.bg} px-2 py-0.5 rounded-full`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-gray-900">{name}</p>
                        {isDuplicate && (
                          <span title="Auch beworben auf eine andere Stelle" className="text-[#3572E8] cursor-help">
                            <Link2 size={13} />
                          </span>
                        )}
                      </div>
                      {app.berufserfahrung_kurz && (
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{app.berufserfahrung_kurz}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell truncate max-w-[150px]">
                      {app.job_campaigns?.jobtitel || '–'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">
                      {formatDate(app.bewerbungsdatum)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {app.qualifikations_score ? (
                        <div className="flex gap-0.5 justify-center">
                          {[1, 2, 3, 4, 5].map(n => (
                            <Star key={n} size={10} className={n <= app.qualifikations_score! ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-300">–</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {app.feedback_datum ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Erledigt</span>
                      ) : hasPendingFeedback ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">Offen</span>
                      ) : (
                        <span className="text-gray-300">–</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <ChevronRight size={16} className="text-gray-400" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Talent Pool view */
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                <th className="px-5 py-3.5 font-medium">Kandidat</th>
                <th className="px-5 py-3.5 font-medium hidden md:table-cell">Ursprungskampagne</th>
                <th className="px-5 py-3.5 font-medium hidden sm:table-cell">Verfügbar ab</th>
                <th className="px-5 py-3.5 font-medium text-center">Score</th>
                <th className="px-5 py-3.5 font-medium hidden lg:table-cell">Tags</th>
                <th className="px-5 py-3.5 font-medium hidden lg:table-cell">Im Pool seit</th>
                <th className="px-5 py-3.5 font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(app => {
                const name = `${app.vorname || 'Kandidat'}${app.nachname_initial ? ` ${app.nachname_initial}.` : ''}`
                const days = daysInPool(app.talent_pool_date)

                return (
                  <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{name}</p>
                      {app.berufserfahrung_kurz && (
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{app.berufserfahrung_kurz}</p>
                      )}
                      {app.talent_pool_reason && (
                        <p className="text-xs text-gray-400 mt-0.5 italic truncate max-w-[250px]">{app.talent_pool_reason}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell truncate max-w-[150px]">
                      {app.job_campaigns?.jobtitel || '–'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">
                      {app.verfuegbar_ab ? formatDate(app.verfuegbar_ab) : '–'}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {app.qualifikations_score ? (
                        <div className="flex gap-0.5 justify-center">
                          {[1, 2, 3, 4, 5].map(n => (
                            <Star key={n} size={10} className={n <= app.qualifikations_score! ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                          ))}
                        </div>
                      ) : <span className="text-gray-300">–</span>}
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(app.tags || []).map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 hidden lg:table-cell">
                      {days} Tage
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSuggestApp(app) }}
                          className="text-xs font-medium text-[#3572E8] hover:underline whitespace-nowrap"
                        >
                          Vorschlagen
                        </button>
                        <button
                          onClick={() => setSelected(app)}
                          className="text-xs text-gray-500 hover:text-gray-700 whitespace-nowrap"
                        >
                          Profil
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide-over detail panel */}
      {selected && (
        <ApplicantDetail
          application={selected}
          onClose={() => setSelected(null)}
          onUpdate={() => {
            fetchData()
            setSelected(null)
          }}
          onReject={view === 'active' ? (app) => { setSelected(null); setRejectApp(app) } : undefined}
        />
      )}

      {/* Export modal */}
      {showExport && (
        <ExportModal
          onClose={() => setShowExport(false)}
          onExport={handleExport}
          showPrivacy
          title="Bewerber exportieren"
        />
      )}

      {/* Suggest for campaign modal */}
      {suggestApp && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setSuggestApp(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-xl w-full max-w-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">Für Kampagne vorschlagen</h3>
                <button onClick={() => setSuggestApp(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                {suggestApp.vorname} {suggestApp.nachname_initial ? `${suggestApp.nachname_initial}.` : ''} für eine aktive Kampagne vorschlagen.
              </p>
              <select
                value={suggestCampaign}
                onChange={e => setSuggestCampaign(e.target.value)}
                className="w-full text-sm rounded-xl border border-gray-100 px-3 py-2 bg-white mb-3 focus:outline-none focus:ring-2 focus:ring-[#3572E8]/30"
              >
                <option value="">Kampagne wählen…</option>
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.jobtitel}</option>)}
              </select>
              <textarea
                value={suggestNote}
                onChange={e => setSuggestNote(e.target.value)}
                placeholder="Optionale Notiz…"
                rows={3}
                className="w-full text-sm rounded-xl border border-gray-100 px-3 py-2 bg-white mb-4 focus:outline-none focus:ring-2 focus:ring-[#3572E8]/30 resize-none"
              />
              <button
                onClick={handleSuggestSubmit}
                disabled={!suggestCampaign}
                className="w-full bg-[#3572E8] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#2b5ec5] transition-colors disabled:opacity-40"
              >
                Vorschlag senden
              </button>
            </div>
          </div>
        </>
      )}

      {/* Reject / move to pool modal */}
      {rejectApp && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setRejectApp(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-xl w-full max-w-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">Bewerber absagen</h3>
                <button onClick={() => setRejectApp(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
              </div>

              <div className="space-y-3 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="reject" checked={rejectChoice === 'reject'} onChange={() => setRejectChoice('reject')} className="text-[#3572E8] focus:ring-[#3572E8]" />
                  <span className="text-sm text-gray-700">Endgültig absagen</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="reject" checked={rejectChoice === 'pool'} onChange={() => setRejectChoice('pool')} className="text-[#3572E8] focus:ring-[#3572E8]" />
                  <span className="text-sm text-gray-700">In den Talent Pool verschieben</span>
                </label>
              </div>

              {rejectChoice === 'pool' && (
                <div className="space-y-3 mb-4">
                  <input
                    value={poolReason}
                    onChange={e => setPoolReason(e.target.value)}
                    placeholder="Grund für den Pool…"
                    className="w-full text-sm rounded-xl border border-gray-100 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#3572E8]/30"
                  />
                  <input
                    value={poolTags}
                    onChange={e => setPoolTags(e.target.value)}
                    placeholder="Tags (kommagetrennt)…"
                    className="w-full text-sm rounded-xl border border-gray-100 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#3572E8]/30"
                  />
                </div>
              )}

              <button
                onClick={handleRejectSubmit}
                className="w-full bg-[#3572E8] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#2b5ec5] transition-colors"
              >
                {rejectChoice === 'pool' ? 'In Talent Pool verschieben' : 'Absage bestätigen'}
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  )
}
