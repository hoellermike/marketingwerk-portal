import { useState } from 'react'
import { Star, Check, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatDate } from '../lib/format'

interface Application {
  id: string
  status: string
  kunden_interesse: string | null
  kunden_rating: number | null
  kunden_feedback_positiv: string | null
  kunden_feedback_negativ: string | null
  naechster_schritt: string | null
  feedback_datum: string | null
}

interface Props {
  application: Application
  onFeedbackSaved: () => void
}

const schrittOptions = [
  'Zum Interview einladen',
  'Absage',
  'Mehr Informationen',
  'Mit anderem vergleichen',
] as const

export default function ApplicantFeedback({ application, onFeedbackSaved }: Props) {
  const hasFeedback = !!application.feedback_datum
  const isVorgestellt = application.status === 'Vorgestellt'

  const [interesse, setInteresse] = useState<string>(application.kunden_interesse || '')
  const [rating, setRating] = useState<number>(application.kunden_rating || 0)
  const [positiv, setPositiv] = useState<string>(application.kunden_feedback_positiv || '')
  const [negativ, setNegativ] = useState<string>(application.kunden_feedback_negativ || '')
  const [schritt, setSchritt] = useState<string>(application.naechster_schritt || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Not yet presented — show waiting message
  if (!isVorgestellt && !hasFeedback) {
    return (
      <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-5">
        <Clock size={18} className="text-blue-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-900">Dieser Bewerber wird noch geprüft</p>
          <p className="text-xs text-gray-500 mt-0.5">Sobald die Vorqualifizierung abgeschlossen ist, können Sie hier Ihr Feedback abgeben.</p>
        </div>
      </div>
    )
  }

  // Show readonly summary
  if (hasFeedback || saved) {
    return (
      <div className="space-y-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-2">
          <Check size={16} className="text-emerald-600" />
          <span className="text-sm text-emerald-700 font-medium">
            Feedback abgegeben am {formatDate(application.feedback_datum || new Date().toISOString())}
          </span>
        </div>
        <div className="space-y-3 text-sm">
          <Row label="Interesse" value={application.kunden_interesse || interesse} />
          {(application.kunden_rating || rating) > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Bewertung</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star key={n} size={14} className={n <= (application.kunden_rating || rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                ))}
              </div>
            </div>
          )}
          {(application.kunden_feedback_positiv || positiv) && <Row label="Was gefällt" value={application.kunden_feedback_positiv || positiv} />}
          {(application.kunden_feedback_negativ || negativ) && <Row label="Was fehlt" value={application.kunden_feedback_negativ || negativ} />}
          <Row label="Nächster Schritt" value={application.naechster_schritt || schritt} />
        </div>
      </div>
    )
  }

  // Feedback form
  const canSubmit = interesse && schritt && !saving

  async function handleSubmit() {
    if (!canSubmit) return
    setSaving(true)
    const { error } = await supabase.from('applications').update({
      kunden_interesse: interesse,
      kunden_rating: rating || null,
      kunden_feedback_positiv: positiv || null,
      kunden_feedback_negativ: negativ || null,
      naechster_schritt: schritt,
      feedback_datum: new Date().toISOString(),
    }).eq('id', application.id)
    setSaving(false)
    if (!error) {
      setSaved(true)
      onFeedbackSaved()
    }
  }

  return (
    <div className="space-y-5">
      {/* Interesse */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-2 block">Interesse an diesem Kandidaten? *</label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'Ja', emoji: '✅', label: 'Ja', active: 'bg-emerald-100 border-emerald-300 text-emerald-700' },
            { value: 'Nein', emoji: '❌', label: 'Nein', active: 'bg-red-100 border-red-300 text-red-700' },
            { value: 'Unsicher', emoji: '🤔', label: 'Unsicher', active: 'bg-amber-100 border-amber-300 text-amber-700' },
          ] as const).map(opt => (
            <button
              key={opt.value}
              onClick={() => setInteresse(opt.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                interesse === opt.value ? opt.active : 'border-card-border text-gray-500 hover:bg-content-bg'
              }`}
            >
              <span className="text-xl">{opt.emoji}</span>
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-2 block">Bewertung</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setRating(n)} className="transition-transform hover:scale-110">
              <Star size={24} className={n <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-200'} />
            </button>
          ))}
        </div>
      </div>

      {/* Positiv */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Was gefällt Ihnen?</label>
        <textarea
          value={positiv}
          onChange={e => setPositiv(e.target.value)}
          rows={2}
          className="w-full text-sm rounded-xl border border-card-border p-3 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          placeholder="Stärken, Qualifikationen, Erfahrung…"
        />
      </div>

      {/* Negativ */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Was fehlt Ihnen?</label>
        <textarea
          value={negativ}
          onChange={e => setNegativ(e.target.value)}
          rows={2}
          className="w-full text-sm rounded-xl border border-card-border p-3 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          placeholder="Fehlende Erfahrung, Bedenken…"
        />
      </div>

      {/* Nächster Schritt */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Nächster Schritt *</label>
        <select
          value={schritt}
          onChange={e => setSchritt(e.target.value)}
          className="w-full text-sm rounded-xl border border-card-border p-3 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        >
          <option value="">Bitte wählen…</option>
          {schrittOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full text-sm font-medium bg-accent text-white px-4 py-2.5 rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50"
      >
        {saving ? 'Wird gespeichert…' : 'Feedback absenden'}
      </button>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium text-right max-w-[60%]">{value}</span>
    </div>
  )
}
