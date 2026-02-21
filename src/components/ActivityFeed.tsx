import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Users, BarChart3, Play, Square, CreditCard } from 'lucide-react'

interface Activity {
  id: string
  client_id: string
  type: string
  title: string
  description: string | null
  created_at: string
}

const iconMap: Record<string, { icon: typeof Users; color: string }> = {
  lead: { icon: Users, color: 'bg-accent/10 text-accent' },
  kpi_update: { icon: BarChart3, color: 'bg-green-100 text-green-600' },
  campaign_started: { icon: Play, color: 'bg-accent/10 text-accent' },
  campaign_ended: { icon: Square, color: 'bg-gray-100 text-gray-500' },
  credit: { icon: CreditCard, color: 'bg-yellow-100 text-yellow-600' },
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'gerade eben'
  if (mins < 60) return `vor ${mins} Min.`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `vor ${hours} Std.`
  const days = Math.floor(hours / 24)
  if (days < 30) return `vor ${days} Tagen`
  return `vor ${Math.floor(days / 30)} Mon.`
}

export default function ActivityFeed() {
  const { client } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    if (!client) return
    supabase
      .from('activity_feed')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => setActivities(data || []))
  }, [client])

  if (activities.length === 0) return null

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Letzte Aktivitäten</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="space-y-4">
          {activities.map((a, i) => {
            const { icon: Icon, color } = iconMap[a.type] || iconMap.lead
            return (
              <div key={a.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                    <Icon size={14} />
                  </div>
                  {i < activities.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                </div>
                <div className="min-w-0 pb-1">
                  <p className="text-sm font-medium text-gray-900">{a.title}</p>
                  {a.description && <p className="text-xs text-gray-500">{a.description}</p>}
                  <p className="text-[11px] text-gray-400 mt-0.5">{relativeTime(a.created_at)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
