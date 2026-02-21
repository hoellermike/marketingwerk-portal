import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import StatusBadge from '../components/StatusBadge'
import PerformanceChart from '../components/PerformanceChart'
import StatCard from '../components/StatCard'
import { ArrowLeft, Users, MessageSquare, ThumbsUp, Phone, Send, ExternalLink } from 'lucide-react'

interface Campaign {
  id: string
  name: string
  type: string | null
  channels: string[] | null
  status: string
  target_audience: string | null
  start_date: string | null
}

interface Performance {
  week: string
  contacted: number
  accepted: number
  replies: number
  positive: number
  calls: number
}

interface HotLead {
  id: string
  name: string
  company: string | null
  position: string | null
  linkedin_url: string | null
  channel: string | null
  status: string | null
  handed_over_at: string | null
}

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [performance, setPerformance] = useState<Performance[]>([])
  const [hotLeads, setHotLeads] = useState<HotLead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from('campaigns').select('*').eq('id', id).single(),
      supabase.from('performance').select('*').eq('campaign_id', id).order('week'),
      supabase.from('hot_leads').select('*').eq('campaign_id', id).order('handed_over_at', { ascending: false }),
    ]).then(([campRes, perfRes, leadsRes]) => {
      setCampaign(campRes.data)
      setPerformance(perfRes.data || [])
      setHotLeads(leadsRes.data || [])
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" /></div>
  }

  if (!campaign) {
    return <div className="text-center py-20 text-gray-500">Kampagne nicht gefunden</div>
  }

  const totals = performance.reduce(
    (acc, p) => ({
      contacted: acc.contacted + p.contacted,
      accepted: acc.accepted + p.accepted,
      replies: acc.replies + p.replies,
      positive: acc.positive + p.positive,
      calls: acc.calls + p.calls,
    }),
    { contacted: 0, accepted: 0, replies: 0, positive: 0, calls: 0 }
  )

  return (
    <div className="max-w-6xl mx-auto">
      <Link to="/campaigns" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Zurück
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">{campaign.name}</h1>
          <StatusBadge status={campaign.status} />
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          {campaign.type && <span>Typ: {campaign.type}</span>}
          {campaign.target_audience && <span>Zielgruppe: {campaign.target_audience}</span>}
          {campaign.start_date && <span>Start: {new Date(campaign.start_date).toLocaleDateString('de-AT')}</span>}
        </div>
        {campaign.channels && campaign.channels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {campaign.channels.map((ch) => (
              <span key={ch} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{ch}</span>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance</h2>
        <PerformanceChart data={performance} />
      </div>

      {/* KPI totals */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={Send} label="Kontaktiert" value={totals.contacted} />
        <StatCard icon={Users} label="Akzeptiert" value={totals.accepted} color="text-purple-600" />
        <StatCard icon={MessageSquare} label="Antworten" value={totals.replies} color="text-pink-500" />
        <StatCard icon={ThumbsUp} label="Positiv" value={totals.positive} color="text-cyan-500" />
        <StatCard icon={Phone} label="Calls" value={totals.calls} color="text-green-500" />
      </div>

      {/* Hot Leads */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hot Leads</h2>
        {hotLeads.length === 0 ? (
          <p className="text-gray-400 text-sm">Noch keine Hot Leads vorhanden</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Unternehmen</th>
                  <th className="pb-2 font-medium">Position</th>
                  <th className="pb-2 font-medium">Kanal</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Übergabe</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {hotLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-50">
                    <td className="py-2.5 font-medium text-gray-900">{lead.name}</td>
                    <td className="py-2.5 text-gray-600">{lead.company || '–'}</td>
                    <td className="py-2.5 text-gray-600">{lead.position || '–'}</td>
                    <td className="py-2.5 text-gray-600">{lead.channel || '–'}</td>
                    <td className="py-2.5">{lead.status ? <StatusBadge status={lead.status} /> : '–'}</td>
                    <td className="py-2.5 text-gray-600">
                      {lead.handed_over_at ? new Date(lead.handed_over_at).toLocaleDateString('de-AT') : '–'}
                    </td>
                    <td className="py-2.5">
                      {lead.linkedin_url && (
                        <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent/80">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
