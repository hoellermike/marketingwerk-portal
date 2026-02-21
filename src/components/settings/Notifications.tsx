import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from './Toast'

interface NotifPref {
  id: string; event_type: string; portal_enabled: boolean; email_enabled: boolean; email_mode: string;
}

const EVENT_LABELS: Record<string, string> = {
  new_application: 'Neue Bewerbung',
  status_change: 'Status-Änderung',
  feedback_received: 'Feedback erhalten',
  interview_scheduled: 'Interview geplant',
  offer_sent: 'Angebot gesendet',
  weekly_report: 'Wochenbericht',
}

export default function Notifications() {
  const { client, user } = useAuth()
  const { toast } = useToast()
  const [prefs, setPrefs] = useState<NotifPref[]>([])
  const [loading, setLoading] = useState(true)
  const [digestMode, setDigestMode] = useState('instant')
  const [quietDate, setQuietDate] = useState('')

  useEffect(() => { if (client && user) load() }, [client, user])

  async function load() {
    const { data } = await supabase.from('notification_preferences').select('*')
      .eq('client_id', client!.id).eq('user_id', user!.id)
    setPrefs(data || [])
    if (data?.length) {
      const emailPref = data.find(d => d.email_mode !== 'off' && d.email_enabled)
      if (emailPref) setDigestMode(emailPref.email_mode)
    }
    // load quiet mode
    const { data: cs } = await supabase.from('client_settings').select('quiet_mode_until').eq('client_id', client!.id).single()
    if (cs?.quiet_mode_until) setQuietDate(cs.quiet_mode_until.slice(0, 10))
    setLoading(false)
  }

  async function update(id: string, field: string, val: boolean) {
    await supabase.from('notification_preferences').update({ [field]: val, updated_at: new Date().toISOString() }).eq('id', id)
    setPrefs(prefs.map(p => p.id === id ? { ...p, [field]: val } : p))
    toast('Einstellung gespeichert')
  }

  async function saveQuiet() {
    await supabase.from('client_settings').update({
      quiet_mode_until: quietDate ? new Date(quietDate).toISOString() : null,
      updated_at: new Date().toISOString(),
    }).eq('client_id', client!.id)
    toast('Ruhe-Modus gespeichert')
  }

  if (loading) return <div className="text-gray-400 p-8">Laden...</div>

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Benachrichtigungen</h2>
      <p className="text-sm text-gray-500 mb-6">Wählen Sie, wie Sie benachrichtigt werden möchten</p>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Ereignis</th>
              <th className="text-center text-xs font-medium text-gray-500 px-4 py-3 w-24">Portal</th>
              <th className="text-center text-xs font-medium text-gray-500 px-4 py-3 w-24">E-Mail</th>
            </tr>
          </thead>
          <tbody>
            {prefs.map(p => (
              <tr key={p.id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 text-sm text-gray-700">{EVENT_LABELS[p.event_type] || p.event_type}</td>
                <td className="px-4 py-3 text-center">
                  <input type="checkbox" checked={p.portal_enabled} onChange={e => update(p.id, 'portal_enabled', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#3572E8] focus:ring-[#3572E8]" />
                </td>
                <td className="px-4 py-3 text-center">
                  <input type="checkbox" checked={p.email_enabled} onChange={e => update(p.id, 'email_enabled', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#3572E8] focus:ring-[#3572E8]" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">E-Mail-Zusammenfassung</h3>
        <div className="flex gap-3">
          {[{ v: 'instant', l: 'Sofort' }, { v: 'digest', l: 'Täglich' }, { v: 'off', l: 'Aus' }].map(o => (
            <button key={o.v} onClick={() => setDigestMode(o.v)}
              className={`px-4 py-2 rounded-xl text-sm border ${digestMode === o.v ? 'border-[#3572E8] bg-blue-50 text-[#3572E8] font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {o.l}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Ruhe-Modus</h3>
        <p className="text-xs text-gray-500 mb-3">Keine Benachrichtigungen bis zum gewählten Datum</p>
        <div className="flex items-center gap-3">
          <input type="date" value={quietDate} onChange={e => setQuietDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3572E8]" />
          <button onClick={saveQuiet} className="bg-[#3572E8] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#2860CC]">Speichern</button>
          {quietDate && <button onClick={() => { setQuietDate(''); saveQuiet() }} className="text-xs text-gray-500 hover:text-red-500">Aufheben</button>}
        </div>
      </div>
    </div>
  )
}
