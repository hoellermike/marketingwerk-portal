import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Users, BarChart3, Play, Square, CreditCard, Activity } from 'lucide-react'

interface ActivityItem {
  id: string
  client_id: string
  type: string
  title: string
  description: string | null
  created_at: string
}

const iconMap: Record<string, { icon: typeof Users; bg: string; text: string }> = {
  lead: { icon: Users, bg: 'bg-gray-50', text: 'text-[#3572E8]' },
  kpi_update: { icon: BarChart3, bg: 'bg-gray-50', text: 'text-emerald-600' },
  campaign_started: { icon: Play, bg: 'bg-gray-50', text: 'text-purple-600' },
  campaign_ended: { icon: Square, bg: 'bg-gray-100', text: 'text-gray-500' },
  credit: { icon: CreditCard, bg: 'bg-gray-50', text: 'text-amber-600' },
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
  const [activities, setActivities] = useState<ActivityItem[]>([])

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

  if (activities.length === 0) return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Activity size={18} className="text-[#3572E8]" />
        <h2 className="text-lg font-semibold text-gray-900">Letzte Aktivitäten</h2>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 py-12 text-center">
        <Activity size={28} className="mx-auto text-gray-300 mb-2" />
        <p className="text-sm text-gray-500 font-medium">Noch keine Aktivitäten</p>
        <p className="text-xs text-gray-400 mt-1">Sobald Aktivitäten stattfinden, sehen Sie diese hier.</p>
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Activity size={18} className="text-[#3572E8]" />
        <h2 className="text-lg font-semibold text-gray-900">Letzte Aktivitäten</h2>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="space-y-4">
          {activities.map((a, i) => {
            const { icon: Icon, bg, text } = iconMap[a.type] || iconMap.lead
            return (
              <div key={a.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                    <Icon size={16} className={text} />
                  </div>
                  {i < activities.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-1" />}
                </div>
                <div className="min-w-0 pb-1 pt-1">
                  <p className="text-sm font-medium text-gray-900">{a.title}</p>
                  {a.description && <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>}
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
