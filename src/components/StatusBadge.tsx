const colors: Record<string, string> = {
  aktiv: 'bg-green-100 text-green-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  pausiert: 'bg-yellow-100 text-yellow-700',
  ended: 'bg-gray-100 text-gray-600',
  beendet: 'bg-gray-100 text-gray-600',
  draft: 'bg-blue-100 text-blue-700',
  entwurf: 'bg-blue-100 text-blue-700',
  setup: 'bg-purple-100 text-purple-700',
  review: 'bg-orange-100 text-orange-700',
}

export default function StatusBadge({ status }: { status: string }) {
  const cls = colors[status.toLowerCase()] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {status}
    </span>
  )
}
