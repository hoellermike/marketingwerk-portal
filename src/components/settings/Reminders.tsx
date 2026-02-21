import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from './Toast'
import Toggle from './Toggle'
import { Link } from 'lucide-react'

interface Reminder {
  id: string; slug: string; name: string; description: string | null;
  target_type: string; is_active: boolean; config: Record<string, number>;
  linked_template_slug: string | null;
}

export default function Reminders() {
  const { client } = useAuth()
  const { toast } = useToast()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (client) load() }, [client])

  async function load() {
    const { data } = await supabase.from('reminders').select('*').eq('client_id', client!.id).order('name')
    setReminders(data || [])
    setLoading(false)
  }

  async function toggle(id: string, val: boolean) {
    await supabase.from('reminders').update({ is_active: val, updated_at: new Date().toISOString() }).eq('id', id)
    setReminders(reminders.map(r => r.id === id ? { ...r, is_active: val } : r))
    toast(val ? 'Erinnerung aktiviert' : 'Erinnerung deaktiviert')
  }

  async function updateConfig(id: string, key: string, val: number) {
    const r = reminders.find(r => r.id === id)
    if (!r) return
    const newConfig = { ...r.config, [key]: val }
    await supabase.from('reminders').update({ config: newConfig, updated_at: new Date().toISOString() }).eq('id', id)
    setReminders(reminders.map(r => r.id === id ? { ...r, config: newConfig } : r))
    toast('Einstellung gespeichert')
  }

  if (loading) return <div className="text-gray-400 p-8">Laden...</div>

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Erinnerungen</h2>
      <p className="text-sm text-gray-500 mb-6">Automatische Erinnerungen für Ihr Team</p>

      <div className="space-y-3">
        {reminders.map(r => (
          <div key={r.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-start gap-4">
            <Toggle enabled={r.is_active} onChange={v => toggle(r.id, v)} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{r.name}</p>
              {r.description && <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>}
              <div className="flex items-center gap-3 mt-2">
                {r.config.days !== undefined && (
                  <label className="flex items-center gap-1.5 text-xs text-gray-600">
                    Nach
                    <select value={r.config.days} onChange={e => updateConfig(r.id, 'days', +e.target.value)}
                      className="border border-gray-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#3572E8]">
                      {[1, 2, 3, 5, 7, 10, 14].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    Tagen
                  </label>
                )}
                {r.config.days_second !== undefined && (
                  <label className="flex items-center gap-1.5 text-xs text-gray-600">
                    2. Erinnerung nach
                    <select value={r.config.days_second} onChange={e => updateConfig(r.id, 'days_second', +e.target.value)}
                      className="border border-gray-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#3572E8]">
                      {[3, 5, 7, 10, 14].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    Tagen
                  </label>
                )}
                {r.config.hours !== undefined && (
                  <label className="flex items-center gap-1.5 text-xs text-gray-600">
                    Vor
                    <select value={r.config.hours} onChange={e => updateConfig(r.id, 'hours', +e.target.value)}
                      className="border border-gray-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#3572E8]">
                      {[1, 2, 4, 12, 24, 48].map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    Stunden
                  </label>
                )}
              </div>
            </div>
            {r.linked_template_slug && (
              <span className="flex items-center gap-1 text-xs text-[#3572E8]">
                <Link size={12} /> {r.linked_template_slug}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
