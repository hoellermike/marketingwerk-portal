import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from './Toast'
import Toggle from './Toggle'
import { Lock, Zap, Plus, X, ChevronRight } from 'lucide-react'

interface Automation {
  id: string; name: string; trigger_type: string; trigger_config: Record<string, unknown>;
  condition_config: Record<string, unknown> | null; action_type: string; action_config: Record<string, unknown>;
  is_active: boolean; is_system: boolean; is_custom: boolean;
  last_triggered_at: string | null; only_once_per_applicant: boolean;
  send_window_start: string | null; send_window_end: string | null;
}

const TRIGGERS = [
  { value: 'status_change', label: 'Status-Änderung' },
  { value: 'new_application', label: 'Neue Bewerbung' },
  { value: 'timer', label: 'Zeitbasiert' },
  { value: 'schedule', label: 'Zeitplan' },
]
const ACTIONS = [
  { value: 'send_email', label: 'E-Mail senden' },
  { value: 'notify', label: 'Benachrichtigung' },
  { value: 'delete_expired_data', label: 'Daten löschen' },
]

function triggerLabel(a: Automation) {
  const cfg = a.trigger_config as Record<string, string>
  if (a.trigger_type === 'status_change') return `Status → ${cfg.to_status || '?'}`
  if (a.trigger_type === 'new_application') return 'Neue Bewerbung'
  if (a.trigger_type === 'timer') return `${cfg.days_after_status || cfg.days_before_event || '?'} Tage`
  if (a.trigger_type === 'schedule') return cfg.day ? `Jeden ${cfg.day}` : 'Täglich'
  return a.trigger_type
}

function actionLabel(a: Automation) {
  const cfg = a.action_config as Record<string, string>
  if (a.action_type === 'send_email') return `E-Mail: ${cfg.template_slug || '?'}`
  if (a.action_type === 'delete_expired_data') return 'Abgelaufene Daten löschen'
  return a.action_type
}

export default function Automations() {
  const { client } = useAuth()
  const { toast } = useToast()
  const [autos, setAutos] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [wizard, setWizard] = useState<{ step: number; trigger: string; action: string; name: string } | null>(null)

  useEffect(() => { if (client) load() }, [client])

  async function load() {
    const { data } = await supabase.from('automations').select('*').eq('client_id', client!.id).order('is_system').order('name')
    setAutos(data || [])
    setLoading(false)
  }

  async function toggle(id: string, val: boolean) {
    await supabase.from('automations').update({ is_active: val, updated_at: new Date().toISOString() }).eq('id', id)
    setAutos(autos.map(a => a.id === id ? { ...a, is_active: val } : a))
    toast(val ? 'Automation aktiviert' : 'Automation deaktiviert')
  }

  async function createNew() {
    if (!wizard || !wizard.name.trim()) return
    const { data } = await supabase.from('automations').insert({
      client_id: client!.id, name: wizard.name, trigger_type: wizard.trigger,
      action_type: wizard.action, is_active: true, trigger_config: {}, action_config: {},
    }).select().single()
    if (data) setAutos([...autos, data])
    setWizard(null)
    toast('Automation erstellt')
  }

  const standard = autos.filter(a => !a.is_system)
  const system = autos.filter(a => a.is_system)

  if (loading) return <div className="text-gray-400 p-8">Laden...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Automationen</h2>
          <p className="text-sm text-gray-500 mt-1">Automatische Aktionen basierend auf Ereignissen</p>
        </div>
        <button onClick={() => setWizard({ step: 1, trigger: 'status_change', action: 'send_email', name: '' })}
          className="flex items-center gap-2 bg-[#3572E8] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#2860CC]">
          <Plus size={16} /> Neue Automation
        </button>
      </div>

      <div className="space-y-3">
        {standard.map(a => (
          <div key={a.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
            <Toggle enabled={a.is_active} onChange={v => toggle(a.id, v)} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{a.name}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">Wenn: {triggerLabel(a)}</span>
                <ChevronRight size={12} />
                <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">Dann: {actionLabel(a)}</span>
              </div>
            </div>
            {a.last_triggered_at && <span className="text-xs text-gray-400">Zuletzt: {new Date(a.last_triggered_at).toLocaleDateString('de')}</span>}
          </div>
        ))}
      </div>

      {system.length > 0 && (
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">System-Automationen</p>
          <div className="space-y-3">
            {system.map(a => (
              <div key={a.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center gap-4 opacity-75">
                <Toggle enabled={a.is_active} onChange={() => {}} disabled />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2">{a.name} <Lock size={12} className="text-gray-400" /></p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">Wenn: {triggerLabel(a)}</span>
                    <ChevronRight size={12} />
                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">Dann: {actionLabel(a)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wizard modal */}
      {wizard && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setWizard(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Neue Automation – Schritt {wizard.step}/3</h3>
              <button onClick={() => setWizard(null)}><X size={18} className="text-gray-400" /></button>
            </div>

            {wizard.step === 1 && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Auslöser wählen</label>
                <div className="space-y-2">
                  {TRIGGERS.map(t => (
                    <button key={t.value} onClick={() => setWizard({ ...wizard, trigger: t.value })}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm ${wizard.trigger === t.value ? 'border-[#3572E8] bg-blue-50 text-[#3572E8]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <button onClick={() => setWizard({ ...wizard, step: 2 })} className="mt-4 w-full bg-[#3572E8] text-white py-2.5 rounded-xl text-sm font-medium">Weiter</button>
              </div>
            )}
            {wizard.step === 2 && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Aktion wählen</label>
                <div className="space-y-2">
                  {ACTIONS.map(a => (
                    <button key={a.value} onClick={() => setWizard({ ...wizard, action: a.value })}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm ${wizard.action === a.value ? 'border-[#3572E8] bg-blue-50 text-[#3572E8]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                      {a.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setWizard({ ...wizard, step: 1 })} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm">Zurück</button>
                  <button onClick={() => setWizard({ ...wizard, step: 3 })} className="flex-1 bg-[#3572E8] text-white py-2.5 rounded-xl text-sm font-medium">Weiter</button>
                </div>
              </div>
            )}
            {wizard.step === 3 && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Name der Automation</label>
                <input value={wizard.name} onChange={e => setWizard({ ...wizard, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3572E8]" placeholder="z.B. Absage nach 14 Tagen" />
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setWizard({ ...wizard, step: 2 })} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm">Zurück</button>
                  <button onClick={createNew} className="flex-1 bg-[#3572E8] text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"><Zap size={14} /> Erstellen</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
