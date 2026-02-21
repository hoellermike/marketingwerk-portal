import { useState } from 'react'
import { Star, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatDate } from '../lib/format'

interface Application {
  id: string
  kunden_feedback: string | null
  kunden_interesse: string | null
  kunden_rating: number | null
  naechster_schritt: string | null
  feedback_datum: string | null
}

interface Props {
  application: Application
  onFeedbackSaved: () => void
}

const interesseOptions = ['Ja', 'Nein', 'Unsicher'] as const
const schrittOptions = ['Zum Interview einladen', 'Absage', 'Mehr Informationen gewünscht'] as const

export default function FeedbackWidget({ application, onFeedbackSaved }: Props) {
  const hasExisting = !!application.feedback_datum
  const [interesse, setInteresse] = useState<string>(application.kunden_interesse || '')
  const [rating, setRating] = useState<number>(application.kunden_rating || 0)
  const [feedback, setFeedback] = useState<string>(application.kunden_feedback || '')
  const [schritt, setSchritt] = useState<string>(application.naechster_schritt || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const readonly = hasExisting || saved

  const canSubmit = interesse && schritt && !saving && !readonly

  async function handleSubmit() {
    if (!canSubmit) return
    setSaving(true)
    const { error } = await supabase.from('applications').update({
      kunden_feedback: feedback || null,
      kunden_interesse: interesse,
      kunden_rating: rating || null,
      naechster_schritt: schritt,
      feedback_datum: new Date().toISOString(),
    }).eq('id', application.id)
    setSaving(false)
    if (!error) {
      setSaved(true)
      onFeedbackSaved()
    }
  }

  if (saved) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-2">
        <Check size={16} className="text-emerald-600" />
        <span className="text-sm text-emerald-700 font-medium">Danke für Ihr Feedback!</span>
      </div>
    )
  }

  return (
    <div className="bg-content-bg rounded-2xl p-4 space-y-3 border border-card-border">
      {readonly && (
        <p className="text-xs text-gray-400">Feedback vom {formatDate(application.feedback_datum)}</p>
      )}

      {/* Interesse */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Interesse *</label>
        <div className="flex gap-2">
          {interesseOptions.map(opt => (
            <button
              key={opt}
              disabled={readonly}
              onClick={() => setInteresse(opt)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                interesse === opt
                  ? opt === 'Ja' ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                    : opt === 'Nein' ? 'bg-red-100 border-red-300 text-red-700'
                    : 'bg-amber-100 border-amber-300 text-amber-700'
                  : 'border-card-border text-gray-500 hover:bg-white'
              } ${readonly ? 'opacity-70 cursor-default' : 'cursor-pointer'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Bewertung</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              disabled={readonly}
              onClick={() => setRating(n)}
              className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <Star size={18} className={n <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
            </button>
          ))}
        </div>
      </div>

      {/* Feedback text */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Feedback</label>
        <textarea
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          disabled={readonly}
          rows={2}
          className="w-full text-sm rounded-xl border border-card-border p-2.5 bg-white resize-none focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-70"
          placeholder="Ihre Einschätzung…"
        />
      </div>

      {/* Nächster Schritt */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Nächster Schritt *</label>
        <select
          value={schritt}
          onChange={e => setSchritt(e.target.value)}
          disabled={readonly}
          className="w-full text-sm rounded-xl border border-card-border p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-70"
        >
          <option value="">Bitte wählen…</option>
          {schrittOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {!readonly && (
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="text-xs font-medium bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Wird gespeichert…' : 'Feedback absenden'}
        </button>
      )}
    </div>
  )
}
