import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import LeadFunnel from '../components/LeadFunnel'
import CampaignTimeline from '../components/CampaignTimeline'
import CampaignCard from '../components/CampaignCard'

export interface JobCampaign {
  id: string
  client_id: string
  jobtitel: string
  status: string
  funnel_status: string | null
  funnel_url: string | null
  start_date: string | null
  end_date: string | null
  daily_budget: number | null
  total_spend: number
  impressions: number
  clicks: number
  total_leads: number
  qualified_leads: number
  ctr: number
  cvr: number
  cpl: number
  cpql: number
  kpi_updated_at: string | null
  reach: number
  link_clicks: number
  cpm: number
  budget_total: number | null
  notes: string | null
}

export default function Campaigns() {
  const { client } = useAuth()
  const [campaigns, setCampaigns] = useState<JobCampaign[]>([])

  useEffect(() => {
    if (!client) return
    supabase
      .from('job_campaigns')
      .select('*')
      .eq('client_id', client.id)
      .order('start_date', { ascending: false })
      .then(({ data }) => setCampaigns(data || []))
  }, [client])

  const totals = campaigns.reduce(
    (acc, c) => ({
      impressions: acc.impressions + c.impressions,
      reach: acc.reach + (c.reach || 0),
      linkClicks: acc.linkClicks + (c.link_clicks || 0),
      applications: acc.applications + c.total_leads,
      qualified: acc.qualified + c.qualified_leads,
    }),
    { impressions: 0, reach: 0, linkClicks: 0, applications: 0, qualified: 0 }
  )

  return (
    <div className="space-y-6">
      {campaigns.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <LeadFunnel {...totals} />
        </div>
      )}

      {campaigns.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <CampaignTimeline campaigns={campaigns} />
        </div>
      )}

      <div className="space-y-3">
        {campaigns.map((c, i) => (
          <CampaignCard key={c.id} campaign={c} defaultOpen={i === 0} />
        ))}
        {campaigns.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-12">Keine Kampagnen vorhanden.</p>
        )}
      </div>
    </div>
  )
}
