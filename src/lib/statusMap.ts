export function mapStatus(internal: string): { label: string; color: string; dot: string; bg: string } {
  const map: Record<string, { label: string; color: string; dot: string; bg: string }> = {
    'Neu':                   { label: 'Eingegangen',    color: 'gray',    dot: 'bg-gray-400',    bg: 'bg-gray-100 text-gray-600' },
    'CV angefragt':          { label: 'Eingegangen',    color: 'gray',    dot: 'bg-gray-400',    bg: 'bg-gray-100 text-gray-600' },
    'In Vorqualifizierung':  { label: 'In Prüfung',     color: 'blue',    dot: 'bg-blue-500',    bg: 'bg-blue-100 text-blue-700' },
    'Qualifiziert':          { label: 'Qualifiziert',   color: 'green',   dot: 'bg-green-500',   bg: 'bg-green-100 text-green-700' },
    'Vorgestellt':           { label: 'Vorgestellt',    color: 'purple',  dot: 'bg-purple-500',  bg: 'bg-purple-100 text-purple-700' },
    'Interview terminiert':  { label: 'Interview',      color: 'cyan',    dot: 'bg-cyan-500',    bg: 'bg-cyan-100 text-cyan-700' },
    'Eingestellt':           { label: 'Eingestellt',    color: 'emerald', dot: 'bg-emerald-600', bg: 'bg-emerald-100 text-emerald-800' },
    'Abgesagt':              { label: 'Nicht passend',  color: 'red',     dot: 'bg-red-500',     bg: 'bg-red-100 text-red-600' },
    'Bewerber hat abgesagt': { label: 'Nicht passend',  color: 'red',     dot: 'bg-red-500',     bg: 'bg-red-100 text-red-600' },
  }
  return map[internal] || { label: internal, color: 'gray', dot: 'bg-gray-400', bg: 'bg-gray-100 text-gray-600' }
}

export const filterChips = ['Alle', 'In Prüfung', 'Qualifiziert', 'Vorgestellt', 'Interview', 'Eingestellt', 'Nicht passend'] as const

export function isInPruefung(status: string): boolean {
  return ['Neu', 'CV angefragt', 'In Vorqualifizierung'].includes(status)
}

export function isQualifiziert(status: string): boolean {
  return ['Qualifiziert', 'Vorgestellt'].includes(status)
}

export function needsFeedback(status: string, feedbackDatum: string | null): boolean {
  return status === 'Vorgestellt' && !feedbackDatum
}
