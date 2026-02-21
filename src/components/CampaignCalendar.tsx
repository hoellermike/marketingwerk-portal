import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import type { JobCampaign } from '../pages/Campaigns'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface CampaignCalendarProps {
  campaigns: JobCampaign[]
  onRefresh: () => void
}

type ViewMode = 'month' | 'quarter' | 'year'

const statusColors: Record<string, string> = {
  aktiv: 'bg-emerald-500', active: 'bg-emerald-500',
  setup: 'bg-[#3572E8] border-dashed border-2 border-[#3572E8] bg-opacity-60',
  draft: 'bg-[#3572E8] border-dashed border-2 border-[#3572E8] bg-opacity-60',
  entwurf: 'bg-[#3572E8] border-dashed border-2 border-[#3572E8] bg-opacity-60',
  review: 'bg-[#3572E8] border-dashed border-2 border-[#3572E8] bg-opacity-60',
  geplant: 'bg-gray-300',
  paused: 'bg-amber-400', pausiert: 'bg-amber-400',
  ended: 'bg-gray-200', beendet: 'bg-gray-200',
}

function getStatusColor(status: string) {
  const s = status.toLowerCase()
  return statusColors[s] || 'bg-gray-300'
}

function getStatusLabel(status: string) {
  const s = status.toLowerCase()
  if (['aktiv', 'active'].includes(s)) return 'Aktiv'
  if (['setup', 'draft', 'entwurf', 'review'].includes(s)) return 'In Vorbereitung'
  if (s === 'geplant') return 'Geplant'
  if (['paused', 'pausiert'].includes(s)) return 'Pausiert'
  if (['ended', 'beendet'].includes(s)) return 'Abgeschlossen'
  return status
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']

function PlanModal({ onClose, onSave }: { onClose: () => void; onSave: (d: { jobtitel: string; start: string; end: string; notiz: string }) => void }) {
  const [jobtitel, setJobtitel] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [notiz, setNotiz] = useState('')
  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3572E8]/20 focus:border-[#3572E8]"
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-gray-100 p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900">Kampagne planen</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Jobtitel *</label><input value={jobtitel} onChange={e => setJobtitel(e.target.value)} className={inputCls} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Start</label><input type="date" value={start} onChange={e => setStart(e.target.value)} className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Ende</label><input type="date" value={end} onChange={e => setEnd(e.target.value)} className={inputCls} /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Notiz</label><input value={notiz} onChange={e => setNotiz(e.target.value)} className={inputCls} /></div>
          <button onClick={() => jobtitel && start && end && onSave({ jobtitel, start, end, notiz })} disabled={!jobtitel || !start || !end}
            className="w-full py-2.5 bg-[#3572E8] text-white rounded-lg text-sm font-medium hover:bg-[#2860d0] disabled:opacity-50 transition-colors">
            Speichern
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CampaignCalendar({ campaigns, onRefresh }: CampaignCalendarProps) {
  const { client } = useAuth()
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [showPlan, setShowPlan] = useState(false)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; campaign: JobCampaign } | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const navigate = (dir: number) => {
    if (viewMode === 'month') setCurrentDate(new Date(year, month + dir, 1))
    else if (viewMode === 'quarter') setCurrentDate(new Date(year, month + dir * 3, 1))
    else setCurrentDate(new Date(year + dir, 0, 1))
  }

  const goToday = () => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))

  // Column generation
  const columns = useMemo(() => {
    if (viewMode === 'month') {
      const days = getDaysInMonth(year, month)
      return Array.from({ length: days }, (_, i) => ({ label: String(i + 1), start: new Date(year, month, i + 1), end: new Date(year, month, i + 2) }))
    } else if (viewMode === 'quarter') {
      const startMonth = Math.floor(month / 3) * 3
      const cols: { label: string; start: Date; end: Date }[] = []
      for (let m = startMonth; m < startMonth + 3; m++) {
        const d = new Date(year, m, 1)
        while (d.getMonth() === m) {
          const weekStart = new Date(d)
          const weekEnd = new Date(d)
          weekEnd.setDate(weekEnd.getDate() + 7)
          const kw = Math.ceil(((d.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7)
          cols.push({ label: `KW${kw}`, start: weekStart, end: weekEnd })
          d.setDate(d.getDate() + 7)
        }
      }
      return cols
    } else {
      return Array.from({ length: 12 }, (_, i) => ({ label: monthNames[i].slice(0, 3), start: new Date(year, i, 1), end: new Date(year, i + 1, 1) }))
    }
  }, [year, month, viewMode])

  const headerLabel = viewMode === 'month' ? `${monthNames[month]} ${year}` : viewMode === 'quarter' ? `Q${Math.floor(month / 3) + 1} ${year}` : String(year)

  // Calculate bar position for a campaign
  const getBar = (c: JobCampaign) => {
    if (!c.start_date) return null
    const s = new Date(c.start_date)
    const e = c.end_date ? new Date(c.end_date) : new Date(s.getTime() + 28 * 86400000)
    const rangeStart = columns[0].start.getTime()
    const rangeEnd = columns[columns.length - 1].end.getTime()
    const totalRange = rangeEnd - rangeStart
    if (e.getTime() < rangeStart || s.getTime() > rangeEnd) return null
    const left = Math.max(0, (s.getTime() - rangeStart) / totalRange) * 100
    const right = Math.min(100, (e.getTime() - rangeStart) / totalRange) * 100
    return { left: `${left}%`, width: `${Math.max(right - left, 1)}%` }
  }

  const todayPos = useMemo(() => {
    if (columns.length === 0) return null
    const rangeStart = columns[0].start.getTime()
    const rangeEnd = columns[columns.length - 1].end.getTime()
    const now = today.getTime()
    if (now < rangeStart || now > rangeEnd) return null
    return `${((now - rangeStart) / (rangeEnd - rangeStart)) * 100}%`
  }, [columns])

  // Pipeline grouping
  const pipeline = useMemo(() => {
    const groups: Record<string, JobCampaign[]> = { 'Briefing': [], 'In Vorbereitung': [], 'Aktiv': [], 'Abgeschlossen': [] }
    for (const c of campaigns) {
      const label = getStatusLabel(c.status)
      if (label === 'Aktiv') groups['Aktiv'].push(c)
      else if (label === 'In Vorbereitung' || label === 'Geplant') groups['In Vorbereitung'].push(c)
      else if (label === 'Abgeschlossen') groups['Abgeschlossen'].push(c)
      else groups['Briefing'].push(c)
    }
    return groups
  }, [campaigns])

  const activeCnt = pipeline['Aktiv'].length
  const plannedCnt = pipeline['In Vorbereitung'].length
  const credits = client?.credits_available ?? 0

  const handlePlanSave = async (d: { jobtitel: string; start: string; end: string; notiz: string }) => {
    if (!client) return
    await supabase.from('job_campaigns').insert({
      client_id: client.id, jobtitel: d.jobtitel, status: 'geplant',
      start_date: d.start, end_date: d.end, notes: d.notiz,
      total_leads: 0, qualified_leads: 0, total_spend: 0, impressions: 0, clicks: 0,
      ctr: 0, cvr: 0, cpl: 0, cpql: 0, reach: 0, link_clicks: 0, cpm: 0,
    })
    setShowPlan(false)
    onRefresh()
  }

  return (
    <div className="space-y-6">
      {showPlan && <PlanModal onClose={() => setShowPlan(false)} onSave={handlePlanSave} />}

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronLeft size={18} /></button>
            <span className="text-lg font-semibold text-gray-900 min-w-[180px] text-center">{headerLabel}</span>
            <button onClick={() => navigate(1)} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronRight size={18} /></button>
            <button onClick={goToday} className="ml-2 px-3 py-1 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Heute</button>
          </div>
          <div className="flex items-center gap-2">
            {(['month', 'quarter', 'year'] as const).map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${viewMode === v ? 'bg-[#3572E8] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                {v === 'month' ? 'Monat' : v === 'quarter' ? 'Quartal' : 'Jahr'}
              </button>
            ))}
            <button onClick={() => setShowPlan(true)} className="ml-2 flex items-center gap-1 px-3 py-1.5 text-xs bg-[#3572E8] text-white rounded-lg hover:bg-[#2860d0]">
              <Plus size={14} /> Kampagne planen
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Column headers */}
            <div className="flex">
              <div className="w-48 shrink-0" />
              <div className="flex-1 flex border-b border-gray-100">
                {columns.map((col, i) => (
                  <div key={i} className="flex-1 text-center text-xs text-gray-400 pb-2 border-r border-gray-50 last:border-r-0">{col.label}</div>
                ))}
              </div>
              <div className="w-28 shrink-0" />
            </div>

            {/* Campaign rows */}
            {campaigns.map(c => {
              const bar = getBar(c)
              return (
                <div key={c.id} className="flex items-center h-10 border-b border-gray-50 group">
                  <div className="w-48 shrink-0 text-sm text-gray-700 truncate pr-3 font-medium">{c.jobtitel}</div>
                  <div className="flex-1 relative h-full">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex">
                      {columns.map((_, i) => <div key={i} className="flex-1 border-r border-gray-50 last:border-r-0" />)}
                    </div>
                    {todayPos && <div className="absolute top-0 bottom-0 w-px bg-red-400 z-10" style={{ left: todayPos }} />}
                    {bar && (
                      <div
                        className={`absolute top-2 h-6 rounded ${getStatusColor(c.status)} cursor-pointer transition-opacity hover:opacity-80`}
                        style={{ left: bar.left, width: bar.width, minWidth: '4px' }}
                        onMouseEnter={e => setTooltip({ x: e.clientX, y: e.clientY, campaign: c })}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    )}
                  </div>
                  <div className="w-28 shrink-0 text-xs text-gray-400 text-right pl-2">
                    {c.total_leads} Bew. | {c.qualified_leads} Qual.
                  </div>
                </div>
              )
            })}
            {campaigns.length === 0 && (
              <div className="text-center py-10 text-sm text-gray-400">Keine Kampagnen im gewählten Zeitraum</div>
            )}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none shadow-lg"
          style={{ left: tooltip.x + 10, top: tooltip.y - 40 }}>
          <div className="font-medium">{tooltip.campaign.jobtitel}</div>
          <div className="text-gray-300">{getStatusLabel(tooltip.campaign.status)} · {tooltip.campaign.total_leads} Bewerbungen</div>
        </div>
      )}

      {/* Pipeline */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Kampagnen-Pipeline</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(pipeline).map(([label, items]) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs font-medium text-gray-500 mb-2">{label} ({items.length})</div>
              <div className="space-y-1.5">
                {items.map(c => (
                  <div key={c.id} className="bg-white rounded-lg px-3 py-2 text-xs text-gray-700 border border-gray-100 truncate">{c.jobtitel}</div>
                ))}
                {items.length === 0 && <div className="text-xs text-gray-300">–</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Credit forecast */}
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-3">
        <p className="text-sm text-gray-600">
          📊 Aktuelle Kampagnen: <span className="font-medium text-gray-900">{activeCnt} aktiv</span> | Geplant: <span className="font-medium text-gray-900">{plannedCnt}</span> | Credits verfügbar: <span className="font-medium text-gray-900">{credits}</span>
        </p>
      </div>
    </div>
  )
}
