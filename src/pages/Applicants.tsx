import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Users, ClipboardCheck, Award, AlertTriangle, UserCheck, Star, Search, ChevronRight, Inbox } from 'lucide-react'
import { mapStatus, filterChips, isInPruefung, isQualifiziert, needsFeedback } from '../lib/statusMap'
import { formatDate, formatNumber } from '../lib/format'
import KPICard from '../components/KPICard'
import ApplicantDetail, { type ApplicationDetail } from '../components/ApplicantDetail'

export default function Applicants() {
  const { client } = useAuth()
  const [applications, setApplications] = useState<ApplicationDetail[]>([])
  const [campaigns, setCampaigns] = useState<{ id: string; jobtitel: string }[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [statusFilter, setStatusFilter] = useState('Alle')
  const [campaignFilter, setCampaignFilter] = useState('')
  const [search, setSearch] = useState('')

  // Detail panel
  const [selected, setSelected] = useState<ApplicationDetail | null>(null)

  const fetchData = () => {
    if (!client) return
    supabase
      .from('applications')
      .select('*, job_campaigns(jobtitel)')
      .eq('client_id', client.id)
      .eq('sichtbar_fuer_kunde', true)
      .order('bewerbungsdatum', { ascending: false })
      .then(({ data }) => {
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

  // KPI counts
  const total = applications.length
  const inPruefung = applications.filter(a => isInPruefung(a.status)).length
  const qualifiziert = applications.filter(a => isQualifiziert(a.status)).length
  const feedbackOffen = applications.filter(a => needsFeedback(a.status, a.feedback_datum)).length
  const eingestellt = applications.filter(a => a.status === 'Eingestellt').length

  // Filter logic
  const filtered = applications.filter(a => {
    const status = mapStatus(a.status)
    if (statusFilter !== 'Alle' && status.label !== statusFilter) return false
    if (campaignFilter && a.job_campaigns?.jobtitel !== campaignFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const nameMatch = (a.vorname || '').toLowerCase().includes(q)
      const profileMatch = (a.berufserfahrung_kurz || '').toLowerCase().includes(q)
      if (!nameMatch && !profileMatch) return false
    }
    return true
  })

  // Count per filter chip
  const chipCounts: Record<string, number> = { Alle: total }
  applications.forEach(a => {
    const label = mapStatus(a.status).label
    chipCounts[label] = (chipCounts[label] || 0) + 1
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bewerber</h1>
        <p className="text-sm text-gray-500 mt-1">Alle Kandidaten im Überblick. Feedback geben und den Prozess vorantreiben.</p>
      </div>

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
          className="text-sm rounded-xl border border-gray-100 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
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
            className="text-sm rounded-xl border border-gray-100 pl-8 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 w-48"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-sm text-gray-400">Laden…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Inbox size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500 font-medium">Noch keine Bewerbungen eingegangen</p>
          <p className="text-xs text-gray-400 mt-1">Sobald die ersten Kandidaten da sind, sehen Sie sie hier.</p>
        </div>
      ) : (
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
                      <p className="font-medium text-gray-900">{name}</p>
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
        />
      )}
    </div>
  )
}
