interface StatusBadgeProps {
  status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colors: Record<string, string> = {
    Aktiv: 'bg-green-100 text-green-700',
    Pausiert: 'bg-yellow-100 text-yellow-700',
    Beendet: 'bg-gray-100 text-gray-600',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}
