const dotColors: Record<string, string> = {
  aktiv: 'bg-emerald-500',
  active: 'bg-emerald-500',
  paused: 'bg-amber-500',
  pausiert: 'bg-amber-500',
  ended: 'bg-gray-400',
  beendet: 'bg-gray-400',
  draft: 'bg-blue-500',
  entwurf: 'bg-blue-500',
  setup: 'bg-purple-500',
  review: 'bg-orange-500',
}

const textColors: Record<string, string> = {
  aktiv: 'text-emerald-700',
  active: 'text-emerald-700',
  paused: 'text-amber-700',
  pausiert: 'text-amber-700',
  ended: 'text-gray-500',
  beendet: 'text-gray-500',
  draft: 'text-blue-700',
  entwurf: 'text-blue-700',
  setup: 'text-purple-700',
  review: 'text-orange-700',
}

export default function StatusBadge({ status }: { status: string }) {
  const dot = dotColors[status.toLowerCase()] || 'bg-gray-400'
  const text = textColors[status.toLowerCase()] || 'text-gray-500'
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium capitalize ${text}`}>
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      {status}
    </span>
  )
}
