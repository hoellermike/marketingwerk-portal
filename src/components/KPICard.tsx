import type { LucideIcon } from 'lucide-react'
import { MoreVertical } from 'lucide-react'

const tintClasses: Record<string, { bg: string; iconBg: string; iconText: string }> = {
  mint: { bg: 'bg-kpi-mint', iconBg: 'bg-emerald-200/60', iconText: 'text-emerald-600' },
  peach: { bg: 'bg-kpi-peach', iconBg: 'bg-orange-200/60', iconText: 'text-orange-600' },
  blue: { bg: 'bg-kpi-blue', iconBg: 'bg-blue-200/60', iconText: 'text-blue-600' },
  purple: { bg: 'bg-kpi-purple', iconBg: 'bg-purple-200/60', iconText: 'text-purple-600' },
  gold: { bg: 'bg-kpi-gold', iconBg: 'bg-amber-200/60', iconText: 'text-amber-600' },
}

interface KPICardProps {
  label: string
  value: string
  icon: LucideIcon
  tint?: 'mint' | 'peach' | 'blue' | 'purple' | 'gold'
  highlighted?: boolean
  trend?: number
  subtitle?: string
}

export default function KPICard({ label, value, icon: Icon, tint, highlighted, trend, subtitle }: KPICardProps) {
  const t = tint ? tintClasses[tint] : null
  const bg = t ? t.bg : highlighted ? 'bg-kpi-gold' : 'bg-white'
  const iconBg = t ? t.iconBg : highlighted ? 'bg-amber-200/60' : 'bg-accent/10'
  const iconText = t ? t.iconText : highlighted ? 'text-amber-600' : 'text-accent'

  return (
    <div className={`rounded-2xl p-5 shadow-sm ${bg}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={18} className={iconText} />
        </div>
        <button className="text-gray-300 hover:text-gray-500 transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend !== undefined && trend !== 0 && (
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
            trend > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  )
}
