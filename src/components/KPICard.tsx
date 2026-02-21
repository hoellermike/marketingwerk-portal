import type { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: string
  icon: LucideIcon
  highlighted?: boolean
}

export default function KPICard({ label, value, icon: Icon, highlighted }: Props) {
  return (
    <div
      className={`rounded-xl border p-5 flex items-center gap-4 ${
        highlighted
          ? 'border-gold bg-gold/5 ring-1 ring-gold/30'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className={`p-2.5 rounded-lg ${highlighted ? 'bg-gold/15 text-gold' : 'bg-accent/10 text-accent'}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}
