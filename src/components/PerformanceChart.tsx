import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface PerformanceData {
  week: string
  contacted: number
  accepted: number
  replies: number
  positive: number
  calls: number
}

interface PerformanceChartProps {
  data: PerformanceData[]
}

const lines = [
  { key: 'contacted', color: '#4361ee', label: 'Kontaktiert' },
  { key: 'accepted', color: '#7209b7', label: 'Akzeptiert' },
  { key: 'replies', color: '#f72585', label: 'Antworten' },
  { key: 'positive', color: '#4cc9f0', label: 'Positiv' },
  { key: 'calls', color: '#4ade80', label: 'Calls' },
]

export default function PerformanceChart({ data }: PerformanceChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Noch keine Performance-Daten vorhanden
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="week" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        {lines.map((l) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.label}
            stroke={l.color}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
