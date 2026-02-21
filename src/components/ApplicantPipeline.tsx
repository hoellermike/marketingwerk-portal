import { useEffect, useState } from 'react'
import { Star, MessageSquarePlus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatDate } from '../lib/format'
import FeedbackWidget from './FeedbackWidget'

interface Application {
  id: string
  applicant_number: number
  vorname: string | null
  status: string
  bewerbungsdatum: string
  berufserfahrung_kurz: string | null
  qualifikations_score: number | null
  kunden_feedback: string | null
  kunden_interesse: string | null
  kunden_rating: number | null
  naechster_schritt: string | null
  feedback_datum: string | null
}

interface Props {
  campaignId: string
}

const statusMap: Record<string, { label: string; color: string; dot: string }> = {
  'Neu':                   { label: 'Eingegangen', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  'CV angefragt':          { label: 'Eingegangen', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  'In Vorqualifizierung':  { label: 'In Prüfung',  color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  'Qualifiziert':          { label: 'Qualifiziert', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  'Vorgestellt':           { label: 'Vorgestellt',  color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  'Interview':             { label: 'Interview',    color: 'bg-cyan-100 text-cyan-700', dot: 'bg-cyan-500' },
  'Eingestellt':           { label: 'Eingestellt',  color: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-600' },
  'Abgesagt':              { label: 'Nicht passend', color: 'bg-red-100 text-red-600', dot: 'bg-red-500' },
  'Bewerber hat abgesagt': { label: 'Nicht passend', color: 'bg-red-100 text-red-600', dot: 'bg-red-500' },
}

const barSegments = [
  { label: 'Eingegangen', color: 'bg-gray-400' },
  { label: 'In Prüfung', color: 'bg-blue-500' },
  { label: 'Qualifiziert', color: 'bg-green-500' },
  { label: 'Vorgestellt', color: 'bg-purple-500' },
  { label: 'Interview', color: 'bg-cyan-500' },
  { label: 'Eingestellt', color: 'bg-emerald-600' },
  { label: 'Nicht passend', color: 'bg-red-500' },
]

const filterChips = ['Alle', 'Eingegangen', 'In Prüfung', 'Qualifiziert', 'Vorgestellt', 'Interview', 'Eingestellt', 'Nicht passend']

function getSimplifiedStatus(raw: string): string {
  return statusMap[raw]?.label || raw
}

function getStatusMeta(raw: string) {
  return statusMap[raw] || { label: raw, color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' }
}

export default function ApplicantPipeline({ campaignId }: Props) {
  const [apps, setApps] = useState<Application[]>([])
  const [filter, setFilter] = useState('Alle')
  const [feedbackOpen, setFeedbackOpen] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchApps = () => {
    supabase
      .from('applications')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('sichtbar_fuer_kunde', true)
      .order('bewerbungsdatum', { ascending: false })
      .then(({ data }) => {
        setApps((data as Application[]) || [])
        setLoading(false)
      })
  }

  useEffect(() => { fetchApps() }, [campaignId])

  if (loading) return null
  if (apps.length === 0) return null

  // Count by simplified status
  const counts: Record<string, number> = {}
  apps.forEach(a => {
    const s = getSimplifiedStatus(a.status)
    counts[s] = (counts[s] || 0) + 1
  })
  const total = apps.length

  const filtered = filter === 'Alle' ? apps : apps.filter(a => getSimplifiedStatus(a.status) === filter)

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Bewerber-Pipeline</h3>

      {/* Status bar */}
      <div className="flex h-3 rounded-full overflow-hidden">
        {barSegments.map(seg => {
          const c = counts[seg.label] || 0
          if (c === 0) return null
          const pct = (c / total) * 100
          return (
            <div
              key={seg.label}
              className={`${seg.color} transition-all`}
              style={{ width: `${pct}%` }}
              title={`${seg.label}: ${c}`}
            />
          )
        })}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {barSegments.map(seg => {
          const c = counts[seg.label] || 0
          if (c === 0) return null
          return (
            <span key={seg.label} className="flex items-center gap-1 text-[10px] text-gray-500">
              <span className={`w-2 h-2 rounded-full ${seg.color}`} />
              {seg.label} ({c})
            </span>
          )
        })}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {filterChips.map(chip => {
          const count = chip === 'Alle' ? total : (counts[chip] || 0)
          if (chip !== 'Alle' && count === 0) return null
          return (
            <button
              key={chip}
              onClick={() => setFilter(chip)}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                filter === chip
                  ? 'bg-[#3572E8] text-white border-[#3572E8]'
                  : 'border-gray-100 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {chip} ({count})
            </button>
          )
        })}
      </div>

      {/* Applicant list */}
      <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
        {filtered.map(app => {
          const meta = getStatusMeta(app.status)
          const showFeedback = app.status === 'Vorgestellt'
          const isFeedbackOpen = feedbackOpen === app.id

          return (
            <div key={app.id} className="bg-white rounded-xl border border-gray-100 p-3 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-gray-900">
                  {app.vorname || `Bewerber #${app.applicant_number}`}
                </span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${meta.color} px-2 py-0.5 rounded-full`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                  {meta.label}
                </span>
                <span className="text-[11px] text-gray-400 ml-auto">{formatDate(app.bewerbungsdatum)}</span>
              </div>

              {app.berufserfahrung_kurz && (
                <p className="text-xs text-gray-500">{app.berufserfahrung_kurz}</p>
              )}

              <div className="flex items-center gap-3">
                {app.qualifikations_score && (
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star key={n} size={12} className={n <= app.qualifikations_score! ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                    ))}
                  </div>
                )}

                {showFeedback && !app.feedback_datum && (
                  <button
                    onClick={() => setFeedbackOpen(isFeedbackOpen ? null : app.id)}
                    className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-[#3572E8] hover:underline"
                  >
                    <MessageSquarePlus size={12} />
                    Feedback geben
                  </button>
                )}
                {app.feedback_datum && (
                  <button
                    onClick={() => setFeedbackOpen(isFeedbackOpen ? null : app.id)}
                    className="ml-auto text-[11px] text-gray-400 hover:underline"
                  >
                    Feedback ansehen
                  </button>
                )}
              </div>

              {isFeedbackOpen && (
                <FeedbackWidget application={app} onFeedbackSaved={fetchApps} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
