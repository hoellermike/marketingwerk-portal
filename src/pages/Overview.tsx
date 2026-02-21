import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Briefcase, Users, Star, CreditCard, AlertTriangle, Info, Activity, ChevronRight } from 'lucide-react'
import { formatCurrency, formatNumber, formatDate, daysRemaining } from '../lib/format'
import { needsFeedback } from '../lib/statusMap'
import KPICard from '../components/KPICard'
import AnnouncementBanner from '../components/AnnouncementBanner'
import QuickActions from '../components/QuickActions'
import StatusBadge from '../components/StatusBadge'
import type { JobCampaign } from './Campaigns'

interface SimpleApplication {
  id: string
  status: string
  feedback_datum: string | null
}

export default function Overview() {
  const { client } = useAuth()
  const [, setSearchParams] = useSearchParams()
  const [campaigns, setCampaigns] = useState<JobCampaign[]>([])
  const [feedbackCount, setFeedbackCount] = useState(0)
  const [activities, setActivities] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])

  useEffect(() => {
    if (!client) return
    supabase
      .from('job_campaigns')
      .select('*')
      .eq('client_id', client.id)
      .order('start_date', { ascending: false })
      .then(({ data }) => setCampaigns((data as JobCampaign[]) || []))

    supabase
      .from('applications')
      .select('id, status, feedback_datum')
      .eq('client_id', client.id)
      .eq('sichtbar_fuer_kunde', true)
      .then(({ data }) => {
        const apps = (data as SimpleApplication[]) || []
        setFeedbackCount(apps.filter(a => needsFeedback(a.status, a.feedback_datum)).length)
      })

    supabase
      .from('activity_feed')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => setActivities(data || []))

    supabase
      .from('contacts')
      .select('*')
      .eq('client_id', client.id)
      .order('sort_order')
      .then(({ data }) => setContacts(data || []))
  }, [client])

  if (!client) return null

  const active = campaigns.filter(c => c.status.toLowerCase() === 'aktiv' || c.status.toLowerCase() === 'active')
  const totalLeads = campaigns.reduce((s, c) => s + c.total_leads, 0)
  const totalQualified = campaigns.reduce((s, c) => s + c.qualified_leads, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Tracking ongoing activities and campaign performance.</p>
      </div>

      <AnnouncementBanner />

      {/* KPIs — max 5 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KPICard label="Aktive Kampagnen" value={String(active.length)} icon={Briefcase} tint="blue" />
        <KPICard label="Bewerbungen" value={formatNumber(totalLeads)} icon={Users} tint="mint" />
        <KPICard label="Qualifizierte Leads" value={formatNumber(totalQualified)} icon={Star} tint="gold" />
        <button onClick={() => setSearchParams({ tab: 'applicants' })} className="text-left">
          <KPICard label="Feedback offen" value={formatNumber(feedbackCount)} icon={AlertTriangle} tint="peach" />
        </button>
        <KPICard label="Credits verfügbar" value={formatNumber(client.credits_available)} icon={CreditCard} tint="gold" />
      </div>

      <QuickActions />

      {/* Activity Feed — compact, max 3 */}
      {activities.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity size={18} className="text-[#3572E8]" />
            <h2 className="text-lg font-semibold text-gray-900">Letzte Aktivitäten</h2>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="space-y-3">
              {activities.map(a => (
                <div key={a.id} className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-[#3572E8] mt-2 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-900">{a.title}</p>
                    {a.description && <p className="text-xs text-gray-500">{a.description}</p>}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => {}}
              className="text-xs text-[#3572E8] hover:underline mt-3 block"
            >
              Mehr anzeigen →
            </button>
          </div>
        </div>
      )}

      {/* Kampagnen-Schnellansicht */}
      {campaigns.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Briefcase size={18} className="text-[#3572E8]" />
            <h2 className="text-lg font-semibold text-gray-900">Kampagnen</h2>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
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
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
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

      {/* Account Info + Team — combined */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Info size={18} className="text-[#3572E8]" />
          <h3 className="text-lg font-semibold text-gray-900">Account & Team</h3>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account info */}
            <div className="space-y-3 text-sm">
              <Row label="Account Manager" value={client.account_owner} />
              <Row label="Status" value={client.status} />
              {client.branche && <Row label="Branche" value={client.branche} />}
              {client.onboarding_date && <Row label="Kunde seit" value={formatDate(client.onboarding_date)} />}
            </div>
            {/* Team */}
            {contacts.length > 0 && (
              <div className="space-y-2">
                {contacts.map((c: any) => {
                  const initials = c.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                  return (
                    <div key={c.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-[#3572E8] flex items-center justify-center text-xs font-bold shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">{c.name}</p>
                        {c.role && <p className="text-xs text-gray-500">{c.role}</p>}
                      </div>
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="text-xs text-[#3572E8] hover:underline">
                          <ChevronRight size={14} />
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
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
