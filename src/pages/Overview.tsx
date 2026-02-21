import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Briefcase, Users, Star, Euro, CreditCard } from 'lucide-react'
import { formatCurrency, formatNumber, formatDate, daysRemaining } from '../lib/format'
import KPICard from '../components/KPICard'
import AnnouncementBanner from '../components/AnnouncementBanner'
import QuickActions from '../components/QuickActions'
import AccountTeam from '../components/AccountTeam'
import StatusBadge from '../components/StatusBadge'

interface Campaign {
  id: string
  jobtitel: string
  status: string
  total_leads: number
  qualified_leads: number
  end_date: string | null
}

export default function Overview() {
  const { client } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    if (!client) return
    supabase
      .from('job_campaigns')
      .select('id, jobtitel, status, total_leads, qualified_leads, end_date')
      .eq('client_id', client.id)
      .order('start_date', { ascending: false })
      .then(({ data }) => setCampaigns(data || []))
  }, [client])

  if (!client) return null

  const active = campaigns.filter(c => c.status.toLowerCase() === 'aktiv' || c.status.toLowerCase() === 'active')
  const totalLeads = campaigns.reduce((s, c) => s + c.total_leads, 0)
  const totalQualified = campaigns.reduce((s, c) => s + c.qualified_leads, 0)
  const totalSpend = 0 // will come from campaigns detail if needed

  return (
    <div className="space-y-6">
      <AnnouncementBanner />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KPICard label="Aktive Kampagnen" value={String(active.length)} icon={Briefcase} />
        <KPICard label="Bewerbungen" value={formatNumber(totalLeads)} icon={Users} />
        <KPICard label="Qualifizierte Leads" value={formatNumber(totalQualified)} icon={Star} highlighted />
        <KPICard label="Gesamtausgaben" value="–" icon={Euro} />
        <KPICard label="Credits verfügbar" value={formatNumber(client.credits_available)} icon={CreditCard} highlighted />
      </div>

      <QuickActions />

      {/* Kampagnen-Schnellansicht */}
      {campaigns.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Kampagnen</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {campaigns.map(c => {
              const days = daysRemaining(c.end_date)
              return (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-sm font-medium text-gray-900 flex-1 min-w-0 truncate">{c.jobtitel}</span>
                  <StatusBadge status={c.status} />
                  <span className="text-xs text-gray-500 w-20 text-right">{formatNumber(c.total_leads)} Bew.</span>
                  <span className="text-xs font-medium text-gold w-16 text-right">{formatNumber(c.qualified_leads)} Qual.</span>
                  {days !== null && days > 0 && (
                    <span className="text-xs text-gray-400 w-20 text-right">{days} Tage</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Account Info + Team */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Account-Info</h3>
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2 text-sm">
            <Row label="Account Manager" value={client.account_owner} />
            <Row label="Status" value={client.status} />
            {client.branche && <Row label="Branche" value={client.branche} />}
            {client.onboarding_date && <Row label="Kunde seit" value={formatDate(client.onboarding_date)} />}
          </div>
        </div>
        <AccountTeam />
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  )
}
