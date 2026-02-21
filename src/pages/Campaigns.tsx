import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import StatusBadge from '../components/StatusBadge'
import { Megaphone } from 'lucide-react'

interface Campaign {
  id: string
  name: string
  type: string | null
  channels: string[] | null
  status: string
  start_date: string | null
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('campaigns')
      .select('id, name, type, channels, status, start_date')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCampaigns(data || [])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" /></div>
  }

  if (campaigns.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="mx-auto w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-5">
          <Megaphone size={28} className="text-accent" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Noch keine Kampagnen</h2>
        <p className="text-gray-500 text-sm">Sobald deine Kampagnen eingerichtet sind, findest du hier alle Details, Status-Updates und Kanäle auf einen Blick.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Kampagnen</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((c) => (
          <Link
            key={c.id}
            to={`/campaigns/${c.id}`}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-accent/30 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">{c.name}</h3>
              <StatusBadge status={c.status} />
            </div>
            {c.type && <p className="text-xs text-gray-500 mb-2">{c.type}</p>}
            {c.channels && c.channels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {c.channels.map((ch) => (
                  <span key={ch} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                    {ch}
                  </span>
                ))}
              </div>
            )}
            {c.start_date && (
              <p className="text-xs text-gray-400">Start: {new Date(c.start_date).toLocaleDateString('de-AT')}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
