import { formatNumber } from '../lib/format'

interface Props {
  impressions: number
  reach: number
  linkClicks: number
  applications: number
  qualified: number
}

export default function LeadFunnel({ impressions, reach, linkClicks, applications, qualified }: Props) {
  const max = impressions || 1
  const bars = [
    { label: 'Impressions', value: impressions, color: 'bg-gray-300' },
    { label: 'Reichweite', value: reach, color: 'bg-gray-400' },
    { label: 'Link-Klicks', value: linkClicks, color: 'bg-accent/40' },
    { label: 'Bewerbungen', value: applications, color: 'bg-accent/70' },
    { label: 'Qualifiziert', value: qualified, color: 'bg-gold' },
  ]

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead-Funnel</h2>
      <div className="space-y-3">
        {bars.map(b => (
          <div key={b.label} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-24 text-right shrink-0">{b.label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden">
              <div
                className={`${b.color} h-full rounded-full flex items-center justify-end pr-2 text-xs font-medium text-gray-900 transition-all duration-500`}
                style={{ width: `${Math.max((b.value / max) * 100, b.value > 0 ? 8 : 0)}%` }}
              >
                {b.value > 0 ? formatNumber(b.value) : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
