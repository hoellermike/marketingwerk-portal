import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from './Toast'
import { Save } from 'lucide-react'

interface Settings {
  id: string; company_name: string; logo_url: string; website: string;
  email_language: string; address_form: string; sender_name: string;
  reply_to_email: string; email_signature: string;
  auto_archive_months: number; auto_delete_months: number;
  gdpr_footer_enabled: boolean; gdpr_consent_text: string;
}

export default function GeneralSettings() {
  const { client } = useAuth()
  const { toast } = useToast()
  const [s, setS] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (client) load() }, [client])

  async function load() {
    const { data } = await supabase.from('client_settings').select('*').eq('client_id', client!.id).single()
    setS(data || null)
    setLoading(false)
  }

  async function save() {
    if (!s) return
    await supabase.from('client_settings').update({
      company_name: s.company_name, logo_url: s.logo_url, website: s.website,
      email_language: s.email_language, address_form: s.address_form,
      sender_name: s.sender_name, reply_to_email: s.reply_to_email, email_signature: s.email_signature,
      auto_archive_months: s.auto_archive_months, auto_delete_months: s.auto_delete_months,
      gdpr_footer_enabled: s.gdpr_footer_enabled, gdpr_consent_text: s.gdpr_consent_text,
      updated_at: new Date().toISOString(),
    }).eq('id', s.id)
    toast('Einstellungen gespeichert')
  }

  function upd(field: string, val: unknown) { setS(s ? { ...s, [field]: val } as Settings : null) }

  if (loading || !s) return <div className="text-gray-400 p-8">Laden...</div>

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  )

  const Field = ({ label, value, field, type }: { label: string; value: string; field: string; type?: string }) => (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
      <input type={type || 'text'} value={value || ''} onChange={e => upd(field, e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3572E8]" />
    </div>
  )

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Allgemeine Einstellungen</h2>
      <p className="text-sm text-gray-500 mb-6">Grundlegende Konfiguration Ihres Portals</p>

      <Section title="Firmendaten">
        <Field label="Firmenname" value={s.company_name} field="company_name" />
        <Field label="Website" value={s.website} field="website" type="url" />
        <Field label="Logo URL" value={s.logo_url} field="logo_url" type="url" />
      </Section>

      <Section title="Sprache & Ansprache">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Sprache</label>
            <select value={s.email_language} onChange={e => upd('email_language', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3572E8]">
              <option value="de">Deutsch</option>
              <option value="en">Englisch</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Ansprache</label>
            <select value={s.address_form} onChange={e => upd('address_form', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3572E8]">
              <option value="Sie">Sie</option>
              <option value="Du">Du</option>
            </select>
          </div>
        </div>
      </Section>

      <Section title="Absender-Konfiguration">
        <Field label="Absender-Name" value={s.sender_name} field="sender_name" />
        <Field label="Antwort-E-Mail" value={s.reply_to_email} field="reply_to_email" type="email" />
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">E-Mail-Signatur</label>
          <textarea value={s.email_signature || ''} onChange={e => upd('email_signature', e.target.value)} rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#3572E8]" />
        </div>
      </Section>

      <Section title="Datenschutz">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Auto-Archivierung nach (Monate)</label>
            <select value={s.auto_archive_months} onChange={e => upd('auto_archive_months', +e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3572E8]">
              {[3, 6, 9, 12, 18, 24].map(m => <option key={m} value={m}>{m} Monate</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Auto-Löschung nach (Monate)</label>
            <select value={s.auto_delete_months} onChange={e => upd('auto_delete_months', +e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3572E8]">
              {[6, 12, 18, 24, 36].map(m => <option key={m} value={m}>{m} Monate</option>)}
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={s.gdpr_footer_enabled} onChange={e => upd('gdpr_footer_enabled', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[#3572E8] focus:ring-[#3572E8]" />
          DSGVO-Footer in E-Mails anzeigen
        </label>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">DSGVO-Einwilligungstext</label>
          <textarea value={s.gdpr_consent_text || ''} onChange={e => upd('gdpr_consent_text', e.target.value)} rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#3572E8]" />
        </div>
      </Section>

      <div className="flex justify-end">
        <button onClick={save} className="flex items-center gap-2 bg-[#3572E8] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#2860CC]">
          <Save size={16} /> Alle Einstellungen speichern
        </button>
      </div>
    </div>
  )
}
