import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import StatCard from '../components/StatCard'
import { CreditCard, TrendingUp, Megaphone, Users, ExternalLink, Calendar } from 'lucide-react'

export default function Dashboard() {
  const { customer } = useAuth()
  const [activeCampaigns, setActiveCampaigns] = useState(0)
  const [hotLeadsCount, setHotLeadsCount] = useState(0)

  useEffect(() => {
    const fetchStats = async () => {
      const { count: campCount } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Aktiv')
      setActiveCampaigns(campCount || 0)

      const { count: leadsCount } = await supabase
        .from('hot_leads')
        .select('*', { count: 'exact', head: true })
      setHotLeadsCount(leadsCount || 0)
    }
    fetchStats()
  }, [])

  const contractProgress = () => {
    if (!customer?.contract_start || !customer?.contract_end) return 0
    const start = new Date(customer.contract_start).getTime()
    const end = new Date(customer.contract_end).getTime()
    const now = Date.now()
    if (now <= start) return 0
    if (now >= end) return 100
    return Math.round(((now - start) / (end - start)) * 100)
  }

  const formatDate = (d: string | null) => {
    if (!d) return '–'
    return new Date(d).toLocaleDateString('de-AT')
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Willkommen, {customer?.name || '...'}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={CreditCard} label="Credits verfügbar" value={customer?.credits_available ?? 0} color="text-green-600" />
        <StatCard icon={TrendingUp} label="Credits verbraucht" value={customer?.credits_used ?? 0} color="text-orange-500" />
        <StatCard icon={Megaphone} label="Aktive Kampagnen" value={activeCampaigns} />
        <StatCard icon={Users} label="Hot Leads" value={hotLeadsCount} color="text-pink-500" />
      </div>

      {/* Contract progress */}
      {customer?.contract_start && customer?.contract_end && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Vertragslaufzeit</h2>
          <p className="text-gray-900 font-semibold mb-3">
            {formatDate(customer.contract_start)} – {formatDate(customer.contract_end)}
          </p>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className="bg-accent h-2.5 rounded-full transition-all"
              style={{ width: `${contractProgress()}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{contractProgress()}% abgelaufen</p>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        {customer?.leadtable_url && (
          <a
            href={customer.leadtable_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            <ExternalLink size={16} />
            Bewerber verwalten
          </a>
        )}
        {customer?.calendly_url && (
          <a
            href={customer.calendly_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Calendar size={16} />
            Termin buchen
          </a>
        )}
      </div>
    </div>
  )
}
