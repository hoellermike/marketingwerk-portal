import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Briefcase, Users, Star, Euro, CreditCard, Eye, Info } from 'lucide-react'
import { formatCurrency, formatNumber, formatDate, daysRemaining } from '../lib/format'
import KPICard from '../components/KPICard'
import AnnouncementBanner from '../components/AnnouncementBanner'
import QuickActions from '../components/QuickActions'
import AccountTeam from '../components/AccountTeam'
import StatusBadge from '../components/StatusBadge'
import ActivityFeed from '../components/ActivityFeed'
import { MonthlyReportButton } from '../components/ReportButton'
import type { JobCampaign } from './Campaigns'

export default function Overview() {
  const { client } = useAuth()
  const [campaigns, setCampaigns] = useState<JobCampaign[]>([])

  useEffect(() => {
    if (!client) return
    supabase
      .from('job_campaigns')
      .select('*')
      .eq('client_id', client.id)
      .order('start_date', { ascending: false })
      .then(({ data }) => setCampaigns((data as JobCampaign[]) || []))
  }, [client])

  if (!client) return null

  const active = campaigns.filter(c => c.status.toLowerCase() === 'aktiv' || c.status.toLowerCase() === 'active')
  const totalLeads = campaigns.reduce((s, c) => s + c.total_leads, 0)
  const totalQualified = campaigns.reduce((s, c) => s + c.qualified_leads, 0)
  const totalSpend = campaigns.reduce((s, c) => s + (c.total_spend || 0), 0)
  const totalReach = campaigns.reduce((s, c) => s + (c.reach || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Tracking ongoing activities and campaign performance.</p>
        </div>
        {campaigns.length > 0 && <MonthlyReportButton campaigns={campaigns} />}
      </div>

      <AnnouncementBanner />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <KPICard label="Aktive Kampagnen" value={String(active.length)} icon={Briefcase} tint="blue" />
        <KPICard label="Bewerbungen" value={formatNumber(totalLeads)} icon={Users} tint="mint" />
        <KPICard label="Qualifizierte Leads" value={formatNumber(totalQualified)} icon={Star} tint="gold" />
        <KPICard label="Gesamtausgaben" value={formatCurrency(totalSpend)} icon={Euro} tint="peach" />
        <KPICard label="Reichweite" value={formatNumber(totalReach)} icon={Eye} tint="purple" />
        <KPICard label="Credits verfügbar" value={formatNumber(client.credits_available)} icon={CreditCard} tint="gold" />
      </div>

      <QuickActions />

      <ActivityFeed />

      {/* Kampagnen-Schnellansicht */}
      {campaigns.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Briefcase size={18} className="text-accent" />
            <h2 className="text-lg font-semibold text-gray-900">Kampagnen</h2>
          </div>
          <div className="bg-white rounded-2xl border border-card-border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border text-left text-xs text-gray-500">
                  <th className="px-5 py-3.5 font-medium">Kampagne</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium text-right">Bewerbungen</th>
                  <th className="px-5 py-3.5 font-medium text-right">Qualifiziert</th>
                  <th className="px-5 py-3.5 font-medium text-right hidden sm:table-cell">Verbleibend</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => {
                  const days = daysRemaining(c.end_date)
                  return (
                    <tr key={c.id} className="hover:bg-content-bg/50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900 truncate max-w-[200px]">{c.jobtitel}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                      <td className="px-5 py-3.5 text-right text-gray-600">{formatNumber(c.total_leads)}</td>
                      <td className="px-5 py-3.5 text-right font-medium text-amber-600">{formatNumber(c.qualified_leads)}</td>
                      <td className="px-5 py-3.5 text-right text-gray-400 hidden sm:table-cell">
                        {days !== null && days > 0 ? `${days} Tage` : '–'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Account Info + Team */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Info size={18} className="text-accent" />
            <h3 className="text-lg font-semibold text-gray-900">Account-Info</h3>
          </div>
          <div className="bg-white rounded-2xl border border-card-border shadow-sm p-6 space-y-3 text-sm">
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
