import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from './Toast'
import Toggle from './Toggle'
import { Send, Eye, EyeOff, ChevronDown } from 'lucide-react'

interface Template {
  id: string; name: string; slug: string; subject: string; body: string;
  recipient_type: string; is_active: boolean; review_before_send: boolean;
  is_system: boolean; is_custom: boolean;
}

const VARIABLES = [
  { key: '{{bewerber_vorname}}', label: 'Vorname' },
  { key: '{{bewerber_nachname}}', label: 'Nachname' },
  { key: '{{stelle}}', label: 'Stelle' },
  { key: '{{firmenname}}', label: 'Firmenname' },
  { key: '{{status}}', label: 'Status' },
  { key: '{{startdatum}}', label: 'Startdatum' },
  { key: '{{kalenderwoche}}', label: 'KW' },
]

export default function EmailTemplates() {
  const { client } = useAuth()
  const { toast } = useToast()
  const [templates, setTemplates] = useState<Template[]>([])
  const [selected, setSelected] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState(false)
  const [showVars, setShowVars] = useState(false)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { if (client) load() }, [client])

  async function load() {
    const { data } = await supabase.from('email_templates').select('*').eq('client_id', client!.id).order('recipient_type').order('name')
    setTemplates(data || [])
    if (data?.length && !selected) setSelected(data[0])
    setLoading(false)
  }

  async function save() {
    if (!selected) return
    await supabase.from('email_templates').update({
      subject: selected.subject, body: selected.body, is_active: selected.is_active,
      review_before_send: selected.review_before_send, updated_at: new Date().toISOString(),
    }).eq('id', selected.id)
    setTemplates(templates.map(t => t.id === selected.id ? selected : t))
    toast('Vorlage gespeichert')
  }

  function insertVar(v: string) {
    if (!bodyRef.current || !selected) return
    const ta = bodyRef.current
    const start = ta.selectionStart
    const newBody = selected.body.slice(0, start) + v + selected.body.slice(ta.selectionEnd)
    setSelected({ ...selected, body: newBody })
    setShowVars(false)
    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = start + v.length }, 0)
  }

  function replaceVars(text: string): string {
    const today = new Date()
    const dd = String(today.getDate()).padStart(2, '0')
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const yyyy = today.getFullYear()
    const map: Record<string, string> = {
      '{{bewerber_vorname}}': 'Stefan',
      '{{bewerber_nachname}}': 'Müller',
      '{{bewerber_name}}': 'Stefan Müller',
      '{{stelle}}': 'Chef de Rang (m/w/d)',
      '{{firmenname}}': 'Lanserhof',
      '{{standort}}': 'Sylt',
      '{{status}}': 'Qualifiziert',
      '{{interview_datum}}': '15.03.2026',
      '{{interview_uhrzeit}}': '10:00 Uhr',
      '{{portal_link}}': 'https://portal.marketingwerk.at',
      '{{datum_heute}}': `${dd}.${mm}.${yyyy}`,
      '{{ansprechpartner}}': 'Michael Höller',
      '{{startdatum}}': '01.04.2026',
      '{{kalenderwoche}}': 'KW 12',
    }
    let result = text
    for (const [k, v] of Object.entries(map)) {
      result = result.replaceAll(k, v)
    }
    return result
  }

  const grouped = {
    'An Bewerber': templates.filter(t => t.recipient_type === 'applicant'),
    'An Kunde': templates.filter(t => t.recipient_type === 'client'),
    'Eigene': templates.filter(t => t.is_custom),
  }

  if (loading) return <div className="text-gray-400 p-8">Laden...</div>

  return (
    <div className="flex gap-6 h-[calc(100vh-280px)] min-h-[500px]">
      {/* Left: Template list */}
      <div className="w-64 shrink-0 bg-white border border-gray-100 rounded-xl overflow-y-auto">
        {Object.entries(grouped).map(([group, items]) => items.length > 0 && (
          <div key={group}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-4 pt-4 pb-1">{group}</p>
            {items.map(t => (
              <button key={t.id} onClick={() => { setSelected(t); setPreview(false) }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selected?.id === t.id ? 'bg-blue-50 text-[#3572E8] font-medium border-l-2 border-[#3572E8]' : 'text-gray-700 hover:bg-gray-50'}`}>
                <span className={!t.is_active ? 'opacity-50' : ''}>{t.name}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Right: Editor */}
      {selected && (
        <div className="flex-1 flex flex-col bg-white border border-gray-100 rounded-xl p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{selected.name}</h3>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <Toggle enabled={selected.is_active} onChange={v => setSelected({ ...selected, is_active: v })} />
                Aktiv
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <Toggle enabled={selected.review_before_send} onChange={v => setSelected({ ...selected, review_before_send: v })} />
                Review
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-medium text-gray-500 mb-1 block">Betreff</label>
            <input value={selected.subject} onChange={e => setSelected({ ...selected, subject: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3572E8]" />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <label className="text-xs font-medium text-gray-500">Inhalt</label>
            <div className="relative ml-auto">
              <button onClick={() => setShowVars(!showVars)} className="flex items-center gap-1 text-xs text-[#3572E8] hover:text-[#2860CC]">
                Variable einfügen <ChevronDown size={12} />
              </button>
              {showVars && (
                <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 w-48">
                  {VARIABLES.map(v => (
                    <button key={v.key} onClick={() => insertVar(v.key)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50">
                      <span className="text-gray-700">{v.label}</span> <span className="text-gray-400 text-xs">{v.key}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setPreview(!preview)} className="text-gray-400 hover:text-gray-600">
              {preview ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {preview ? (
            <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden overflow-y-auto">
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 text-sm space-y-1">
                <p className="text-gray-600"><span className="font-medium text-gray-700">An:</span> stefan.mueller@example.at</p>
                <p className="text-gray-600"><span className="font-medium text-gray-700">Betreff:</span> {replaceVars(selected.subject)}</p>
              </div>
              <div className="bg-gray-50 px-4 py-4 text-sm text-gray-700 whitespace-pre-wrap">
                {replaceVars(selected.body)}
              </div>
            </div>
          ) : (
            <textarea ref={bodyRef} value={selected.body} onChange={e => setSelected({ ...selected, body: e.target.value })}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-[#3572E8]" />
          )}

          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
            <button onClick={save} className="bg-[#3572E8] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#2860CC] transition-colors">Speichern</button>
            <button onClick={() => toast('Test-E-Mail gesendet')} className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
              <Send size={14} /> Test senden
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
