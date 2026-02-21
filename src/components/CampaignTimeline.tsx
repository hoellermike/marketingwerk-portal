import { useState } from 'react'
import type { JobCampaign } from '../pages/Campaigns'
import { formatDate } from '../lib/format'
import { CalendarDays } from 'lucide-react'

interface Props {
  campaigns: JobCampaign[]
}

const statusColor: Record<string, string> = {
  aktiv: '#3572E8',
  active: '#3572E8',
  pausiert: '#F5C542',
  paused: '#F5C542',
  setup: '#9CA3AF',
  abgeschlossen: '#D1D5DB',
  completed: '#D1D5DB',
}

function getColor(status: string) {
  return statusColor[status.toLowerCase()] || '#9CA3AF'
}

export default function CampaignTimeline({ campaigns }: Props) {
  const [hover, setHover] = useState<string | null>(null)

  const withDates = campaigns.filter(c => c.start_date && c.end_date)
  if (withDates.length === 0) return null

  const allStarts = withDates.map(c => new Date(c.start_date!).getTime())
  const allEnds = withDates.map(c => new Date(c.end_date!).getTime())
  const minTime = Math.min(...allStarts)
  const maxTime = Math.max(...allEnds)
  const buffer = (maxTime - minTime) * 0.05 || 86400000 * 7
  const rangeStart = minTime - buffer
  const rangeEnd = maxTime + buffer
  const range = rangeEnd - rangeStart

  const today = Date.now()
  const todayPct = ((today - rangeStart) / range) * 100

  const months: { label: string; pct: number }[] = []
  const d = new Date(rangeStart)
  d.setDate(1)
  d.setMonth(d.getMonth() + 1)
  while (d.getTime() < rangeEnd) {
    const pct = ((d.getTime() - rangeStart) / range) * 100
    months.push({ label: d.toLocaleDateString('de-AT', { month: 'short', year: '2-digit' }), pct })
    d.setMonth(d.getMonth() + 1)
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays size={18} className="text-[#3572E8]" />
        <h2 className="text-lg font-semibold text-gray-900">Kampagnen-Timeline</h2>
      </div>
      <div className="relative">
        {/* Month labels */}
        <div className="relative h-5 mb-1">
          {months.map((m, i) => (
            <span key={i} className="absolute text-[10px] text-gray-400 -translate-x-1/2" style={{ left: `${m.pct}%` }}>
              {m.label}
            </span>
          ))}
        </div>

        {/* Bars */}
        <div className="relative space-y-2">
          {/* Today marker — blue dashed line */}
          {todayPct >= 0 && todayPct <= 100 && (
            <div
              className="absolute top-0 bottom-0 w-px border-l-2 border-dashed border-[#3572E8] z-10"
              style={{ left: `${todayPct}%` }}
            >
              <span className="absolute -top-5 -translate-x-1/2 text-[10px] text-[#3572E8] font-medium">Heute</span>
            </div>
          )}

          {withDates.map(c => {
            const start = new Date(c.start_date!).getTime()
            const end = new Date(c.end_date!).getTime()
            const leftPct = ((start - rangeStart) / range) * 100
            const widthPct = ((end - start) / range) * 100
            const daysLeft = Math.max(0, Math.ceil((end - today) / 86400000))
            const isHovered = hover === c.id

            return (
              <div key={c.id} className="relative h-9 flex items-center">
                <div
                  className="absolute h-7 rounded-lg cursor-pointer transition-all"
                  style={{
                    left: `${leftPct}%`,
                    width: `${Math.max(widthPct, 1)}%`,
                    backgroundColor: getColor(c.status),
                    opacity: isHovered ? 1 : 0.8,
                  }}
                  onMouseEnter={() => setHover(c.id)}
                  onMouseLeave={() => setHover(null)}
                >
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-medium text-white truncate pr-2" style={{ maxWidth: '100%' }}>
                    {c.jobtitel}
                  </span>

                  {isHovered && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-navy text-white text-xs rounded-xl px-3 py-2 whitespace-nowrap z-20 shadow-lg">
                      <p className="font-semibold">{c.jobtitel}</p>
                      <p className="text-navy-muted">{formatDate(c.start_date)} – {formatDate(c.end_date)}</p>
                      <p>{daysLeft > 0 ? `${daysLeft} Tage verbleibend` : 'Abgelaufen'}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
