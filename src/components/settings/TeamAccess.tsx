import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from './Toast'
import { UserPlus, X } from 'lucide-react'

interface Member {
  id: string; name: string; email: string; role: string;
  campaign_access: string; status: string; user_id: string | null;
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  feedback: 'bg-blue-100 text-blue-700',
  viewer: 'bg-gray-100 text-gray-600',
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin', feedback: 'Feedback', viewer: 'Betrachter',
}

export default function TeamAccess() {
  const { client } = useAuth()
  const { toast } = useToast()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [invName, setInvName] = useState('')
  const [invEmail, setInvEmail] = useState('')
  const [invRole, setInvRole] = useState('viewer')

  useEffect(() => { if (client) load() }, [client])

  async function load() {
    const { data } = await supabase.from('team_members').select('*').eq('client_id', client!.id).order('name')
    setMembers(data || [])
    setLoading(false)
  }

  async function changeRole(id: string, role: string) {
    await supabase.from('team_members').update({ role }).eq('id', id)
    setMembers(members.map(m => m.id === id ? { ...m, role } : m))
    toast('Rolle geändert')
  }

  async function invite() {
    if (!invName.trim() || !invEmail.trim()) return
    const { data } = await supabase.from('team_members').insert({
      client_id: client!.id, name: invName, email: invEmail, role: invRole,
      status: 'invited', campaign_access: 'all',
    }).select().single()
    if (data) setMembers([...members, data])
    setShowInvite(false)
    setInvName(''); setInvEmail(''); setInvRole('viewer')
    toast('Einladung gesendet')
  }

  if (loading) return <div className="text-gray-400 p-8">Laden...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Team & Zugriff</h2>
          <p className="text-sm text-gray-500 mt-1">Verwalten Sie Teammitglieder und deren Zugriffsrechte</p>
        </div>
        <button onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 bg-[#3572E8] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#2860CC]">
          <UserPlus size={16} /> Einladen
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Name</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">E-Mail</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 w-40">Rolle</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 w-32">Kampagnen</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 w-28">Status</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{m.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{m.email}</td>
                <td className="px-4 py-3">
                  <select value={m.role} onChange={e => changeRole(m.id, e.target.value)}
                    className={`text-xs font-medium px-2.5 py-1 rounded-lg border-0 ${ROLE_COLORS[m.role] || 'bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-[#3572E8]`}>
                    <option value="admin">Admin</option>
                    <option value="feedback">Feedback</option>
                    <option value="viewer">Betrachter</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{m.campaign_access === 'all' ? 'Alle' : 'Ausgewählt'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${m.status === 'active' ? 'bg-green-100 text-green-700' : m.status === 'invited' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                    {m.status === 'active' ? 'Aktiv' : m.status === 'invited' ? 'Eingeladen' : 'Deaktiviert'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInvite && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowInvite(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Teammitglied einladen</h3>
              <button onClick={() => setShowInvite(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Name</label>
                <input value={invName} onChange={e => setInvName(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3572E8]" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">E-Mail</label>
                <input value={invEmail} onChange={e => setInvEmail(e.target.value)} type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3572E8]" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Rolle</label>
                <select value={invRole} onChange={e => setInvRole(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3572E8]">
                  <option value="admin">Admin</option>
                  <option value="feedback">Feedback</option>
                  <option value="viewer">Betrachter</option>
                </select>
              </div>
            </div>
            <button onClick={invite} className="mt-4 w-full bg-[#3572E8] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#2860CC]">Einladung senden</button>
          </div>
        </div>
      )}
    </div>
  )
}
