import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useToast } from '../contexts/ToastContext'

interface Props {
  applicant: { id: string; vorname: string | null; nachname_initial: string | null; status: string }
  onClose: () => void
  onDone: () => void
}

const tagOptions = ['Gastronomie', 'Service', 'Pflege', 'Handwerk', 'Büro', 'Technik']

export default function RejectionDialog({ applicant, onClose, onDone }: Props) {
  const { showToast } = useToast()
  const [choice, setChoice] = useState<'reject' | 'pool'>('pool')
  const [reason, setReason] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [verfuegbarAb, setVerfuegbarAb] = useState('')
  const [sendEmail, setSendEmail] = useState(false)
  const [saving, setSaving] = useState(false)

  const name = `${applicant.vorname || 'Bewerber'}${applicant.nachname_initial ? ` ${applicant.nachname_initial}.` : ''}`

  const toggleTag = (tag: string) => setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])

  const handleConfirm = async () => {
    setSaving(true)
    if (choice === 'pool') {
      await supabase.from('applications').update({
        is_talent_pool: true,
        talent_pool_date: new Date().toISOString(),
        talent_pool_reason: reason || null,
        tags: tags.length > 0 ? tags : null,
        verfuegbar_ab: verfuegbarAb || null,
      }).eq('id', applicant.id)
      showToast(`${name} wurde in den Talent Pool verschoben`)
    } else {
      await supabase.from('applications').update({ status: 'Nicht passend' }).eq('id', applicant.id)
      showToast(`${name} wurde als "Nicht passend" markiert`)
    }
    setSaving(false)
    onDone()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Bewerber absagen?</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
          </div>

          <p className="text-sm text-gray-500 mb-5">
            {name} wird als &quot;Nicht passend&quot; markiert.
          </p>

          <div className="space-y-3 mb-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="rejChoice" checked={choice === 'reject'} onChange={() => setChoice('reject')} className="text-[#3572E8] focus:ring-[#3572E8]" />
              <span className="text-sm text-gray-700">Endgültig absagen</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="rejChoice" checked={choice === 'pool'} onChange={() => setChoice('pool')} className="text-[#3572E8] focus:ring-[#3572E8]" />
              <span className="text-sm text-gray-700">In den Talent Pool verschieben</span>
            </label>
          </div>

          {choice === 'pool' && (
            <div className="space-y-3 mb-5 pl-6 border-l-2 border-gray-100">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Grund</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
                  className="w-full text-sm rounded-xl border border-gray-100 p-3 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#3572E8]/30 focus:border-[#3572E8]"
                  placeholder="Warum in den Pool?" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {tagOptions.map(tag => (
                    <button key={tag} type="button" onClick={() => toggleTag(tag)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        tags.includes(tag) ? 'bg-[#3572E8] text-white border-[#3572E8]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Verfügbar ab</label>
                <input type="date" value={verfuegbarAb} onChange={e => setVerfuegbarAb(e.target.value)}
                  className="w-full text-sm rounded-xl border border-gray-100 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#3572E8]/30 focus:border-[#3572E8]" />
              </div>
            </div>
          )}

          <div className="mb-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} className="rounded text-[#3572E8] focus:ring-[#3572E8]" />
              <span className="text-sm text-gray-700">Absage-E-Mail an den Bewerber senden <span className="text-gray-400">(Vorlage: &quot;Absage freundlich&quot;)</span></span>
            </label>
            {sendEmail && (
              <button type="button" onClick={() => showToast('Vorschau-Funktion wird in Kürze verfügbar', 'info')}
                className="ml-6 mt-1 text-xs text-[#3572E8] hover:underline">
                Vorschau ansehen
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
              Abbrechen
            </button>
            <button onClick={handleConfirm} disabled={saving}
              className="flex-1 px-4 py-2.5 text-sm bg-[#3572E8] text-white rounded-xl hover:bg-[#2860d0] transition-colors font-medium disabled:opacity-50">
              {saving ? 'Wird gespeichert…' : 'Bestätigen'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
