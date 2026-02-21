import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  campaignId: string
  campaignTitle: string
  onClose: () => void
}

const artOptions = [
  'Budget anpassen',
  'Laufzeit verlängern/verkürzen',
  'Kampagne pausieren',
  'Kampagne stoppen',
  'Stellenprofil anpassen',
  'Creatives ändern',
  'Sonstiges',
]

export default function ChangeRequestModal({ campaignId, campaignTitle, onClose }: Props) {
  const { client } = useAuth()
  const [art, setArt] = useState('')
  const [datum, setDatum] = useState('')
  const [details, setDetails] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!client || !details || !art) return
    setSaving(true)
    await supabase.from('change_requests').insert({
      client_id: client.id,
      campaign_id: campaignId,
      art,
      gewuenschtes_datum: datum || null,
      details,
    })
    setSaving(false)
    setDone(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Änderung anfragen</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        {done ? (
          <div className="p-6 text-center space-y-3">
            <div className="mx-auto w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check size={20} className="text-emerald-600" />
            </div>
            <p className="text-sm text-gray-700">Ihre Änderungsanfrage wurde übermittelt. Ihr Account Manager meldet sich innerhalb von 24h.</p>
            <button onClick={onClose} className="text-xs text-[#3572E8] hover:underline">Schließen</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Kampagne</label>
              <input value={campaignTitle} disabled className="w-full text-sm rounded-xl border border-gray-100 p-2.5 bg-gray-50 text-gray-500" />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Art der Änderung *</label>
              <select
                value={art}
                onChange={e => setArt(e.target.value)}
                required
                className="w-full text-sm rounded-xl border border-gray-100 p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">Bitte wählen…</option>
                {artOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Ab wann</label>
              <input
                type="date"
                value={datum}
                onChange={e => setDatum(e.target.value)}
                className="w-full text-sm rounded-xl border border-gray-100 p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Details *</label>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                required
                rows={3}
                className="w-full text-sm rounded-xl border border-gray-100 p-2.5 bg-white resize-none focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Beschreiben Sie die gewünschte Änderung…"
              />
            </div>

            <button
              type="submit"
              disabled={saving || !art || !details}
              className="w-full text-sm font-medium bg-[#3572E8] text-white py-2.5 rounded-xl hover:bg-[#3572E8]/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Wird gesendet…' : 'Anfrage absenden'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
