import type { LucideIcon } from 'lucide-react'

const iconColors: Record<string, string> = {
  mint: 'text-emerald-600',
  peach: 'text-orange-600',
  blue: 'text-[#3572E8]',
  purple: 'text-purple-600',
  gold: 'text-amber-600',
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

export default function KPICard({ label, value, icon: Icon, tint, trend, subtitle }: KPICardProps) {
  const iconText = tint ? iconColors[tint] : 'text-[#3572E8]'

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50">
          <Icon size={18} className={iconText} />
        </div>
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
