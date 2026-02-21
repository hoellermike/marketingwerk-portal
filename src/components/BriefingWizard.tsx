import { useState, type KeyboardEvent } from 'react'
import { X, Check, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface BriefingWizardProps {
  onClose: () => void
  pastCampaigns?: { id: string; jobtitel: string }[]
}

interface BriefingData {
  // Step 1
  jobtitel: string
  berufsfeld: string
  standort: string
  abteilung: string
  anzahl_positionen: number
  stellenbeschreibung: string
  // Step 2
  muss_anforderungen: string[]
  kann_anforderungen: string[]
  sprachkenntnisse: string
  ausbildung: string
  fuehrerschein: string
  schichtbereitschaft: string[]
  besondere_anforderungen: string
  // Step 3
  gehalt_von: string
  gehalt_bis: string
  gehalt_typ: string
  anstellungsart: string
  arbeitszeiten: string
  benefits: string[]
  startdatum: string
  startdatum_datum: string
  remote: string
  // Step 4
  kampagnenstart: string
  laufzeit: string
  budget: string
  zielregion: string
  dringlichkeit: string
  besondere_wuensche: string
}

const initialData: BriefingData = {
  jobtitel: '', berufsfeld: '', standort: '', abteilung: '', anzahl_positionen: 1, stellenbeschreibung: '',
  muss_anforderungen: [], kann_anforderungen: [], sprachkenntnisse: '', ausbildung: '', fuehrerschein: '', schichtbereitschaft: [], besondere_anforderungen: '',
  gehalt_von: '', gehalt_bis: '', gehalt_typ: 'Brutto monatlich', anstellungsart: '', arbeitszeiten: '', benefits: [], startdatum: 'Zum nächstmöglichen Zeitpunkt', startdatum_datum: '', remote: 'Vor Ort',
  kampagnenstart: '', laufzeit: '', budget: 'Standard', zielregion: '', dringlichkeit: '', besondere_wuensche: '',
}

const steps = ['Stellenprofil', 'Anforderungen', 'Rahmenbedingungen', 'Kampagnen-Details', 'Zusammenfassung']

const allBenefits = ['Personalunterkunft', 'Verpflegung', 'Mitarbeiterrabatte', 'Weiterbildung', 'Jobticket', 'Firmenwagen', 'Bonus', 'Flexible Arbeitszeiten']
const allSchichten = ['Frühschicht', 'Spätschicht', 'Nachtschicht', 'Wochenende', 'Feiertage']

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (t: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('')
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      if (!tags.includes(input.trim())) onChange([...tags, input.trim()])
      setInput('')
    }
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(t => (
          <span key={t} className="inline-flex items-center gap-1 px-3 py-1 bg-[#3572E8]/10 text-[#3572E8] rounded-full text-sm">
            {t}
            <button type="button" onClick={() => onChange(tags.filter(x => x !== t))} className="hover:text-red-500">×</button>
          </span>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3572E8]/20 focus:border-[#3572E8]" />
    </div>
  )
}

function ChipSelect({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (s: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => {
        const active = selected.includes(o)
        return (
          <button key={o} type="button"
            onClick={() => onChange(active ? selected.filter(x => x !== o) : [...selected, o])}
            className={`px-4 py-2 rounded-lg text-sm border transition-all ${active ? 'bg-[#3572E8] text-white border-[#3572E8]' : 'bg-white text-gray-700 border-gray-200 hover:border-[#3572E8]/40'}`}>
            {o}
          </button>
        )
      })}
    </div>
  )
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3572E8]/20 focus:border-[#3572E8] bg-white"
const selectCls = inputCls
const labelCls = "block text-sm font-medium text-gray-700 mb-1"

export default function BriefingWizard({ onClose, pastCampaigns = [] }: BriefingWizardProps) {
  const { client } = useAuth()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<BriefingData>(initialData)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const set = <K extends keyof BriefingData>(key: K, val: BriefingData[K]) => setData(d => ({ ...d, [key]: val }))

  const canNext = step === 0 ? data.jobtitel.trim().length > 0 : true

  const saveToDB = async (status: string) => {
    if (!client) return
    setSaving(true)
    try {
      const briefing = {
        client_id: client.id,
        jobtitel: data.jobtitel,
        status: status === 'eingereicht' ? 'setup' : 'draft',
        briefing_status: status,
        briefing_data: data,
        start_date: data.kampagnenstart || null,
        total_leads: 0, qualified_leads: 0, total_spend: 0, impressions: 0, clicks: 0,
        ctr: 0, cvr: 0, cpl: 0, cpql: 0, reach: 0, link_clicks: 0, cpm: 0,
      }
      await supabase.from('job_campaigns').insert(briefing)
      if (status === 'eingereicht') {
        setSubmitted(true)
      } else {
        setToast('Entwurf gespeichert!')
        setTimeout(() => setToast(''), 3000)
      }
    } catch {
      setToast('Fehler beim Speichern')
      setTimeout(() => setToast(''), 3000)
    }
    setSaving(false)
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-100 p-12 max-w-lg text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Vielen Dank!</h2>
          <p className="text-gray-600 mb-8">Ihr Briefing wurde erfolgreich übermittelt. Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p>
          <button onClick={onClose} className="px-6 py-2.5 bg-[#3572E8] text-white rounded-lg hover:bg-[#2860d0] transition-colors text-sm font-medium">
            Zurück zur Übersicht
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 overflow-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-[60] bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg">{toast}</div>
      )}
      <div className="max-w-3xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold text-gray-900">Neue Kampagne anfragen</h1>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} className="text-gray-500" /></button>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-10">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <button onClick={() => i < step && setStep(i)} className="flex items-center gap-2 shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  i < step ? 'bg-[#3572E8] text-white' : i === step ? 'bg-[#3572E8] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i < step ? <Check size={16} /> : i + 1}
                </div>
                <span className={`text-sm hidden sm:inline ${i === step ? 'font-medium text-gray-900' : 'text-gray-500'}`}>{s}</span>
              </button>
              {i < steps.length - 1 && <div className={`flex-1 h-px mx-3 ${i < step ? 'bg-[#3572E8]' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
          {step === 0 && (
            <div className="space-y-5">
              {pastCampaigns.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 text-sm text-[#3572E8]">
                  💡 Ähnliche Stelle schon mal ausgeschrieben?
                  <div className="flex flex-wrap gap-2 mt-2">
                    {pastCampaigns.map(c => (
                      <span key={c.id} className="px-3 py-1 bg-white rounded-full text-xs border border-[#3572E8]/20">{c.jobtitel}</span>
                    ))}
                  </div>
                </div>
              )}
              <div><label className={labelCls}>Jobtitel *</label><input value={data.jobtitel} onChange={e => set('jobtitel', e.target.value)} className={inputCls} placeholder="z.B. Koch/Köchin" /></div>
              <div><label className={labelCls}>Berufsfeld</label>
                <select value={data.berufsfeld} onChange={e => set('berufsfeld', e.target.value)} className={selectCls}>
                  <option value="">Bitte wählen</option>
                  {['Gastronomie', 'Pflege', 'Handwerk', 'Büro', 'Technik', 'Sonstiges'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Standort</label><input value={data.standort} onChange={e => set('standort', e.target.value)} className={inputCls} placeholder="z.B. Wien, 1010" /></div>
              <div><label className={labelCls}>Abteilung</label><input value={data.abteilung} onChange={e => set('abteilung', e.target.value)} className={inputCls} placeholder="Optional" /></div>
              <div><label className={labelCls}>Anzahl Positionen</label><input type="number" min={1} value={data.anzahl_positionen} onChange={e => set('anzahl_positionen', parseInt(e.target.value) || 1)} className={inputCls} /></div>
              <div><label className={labelCls}>Stellenbeschreibung</label><textarea value={data.stellenbeschreibung} onChange={e => set('stellenbeschreibung', e.target.value)} className={inputCls + ' min-h-[100px]'} placeholder="Optional – beschreiben Sie die Stelle kurz" /></div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div><label className={labelCls}>Muss-Anforderungen</label><TagInput tags={data.muss_anforderungen} onChange={t => set('muss_anforderungen', t)} placeholder="Eingabe + Enter" /></div>
              <div><label className={labelCls}>Kann-Anforderungen</label><TagInput tags={data.kann_anforderungen} onChange={t => set('kann_anforderungen', t)} placeholder="Eingabe + Enter" /></div>
              <div><label className={labelCls}>Sprachkenntnisse</label><input value={data.sprachkenntnisse} onChange={e => set('sprachkenntnisse', e.target.value)} className={inputCls} placeholder="z.B. Deutsch B2, Englisch" /></div>
              <div><label className={labelCls}>Ausbildung</label>
                <select value={data.ausbildung} onChange={e => set('ausbildung', e.target.value)} className={selectCls}>
                  <option value="">Bitte wählen</option>
                  {['Lehre', 'Meister', 'Studium', 'Egal'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Führerschein</label>
                <select value={data.fuehrerschein} onChange={e => set('fuehrerschein', e.target.value)} className={selectCls}>
                  <option value="">Bitte wählen</option>
                  {['Ja (B)', 'Nein', 'Wünschenswert'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Schichtbereitschaft</label><ChipSelect options={allSchichten} selected={data.schichtbereitschaft} onChange={s => set('schichtbereitschaft', s)} /></div>
              <div><label className={labelCls}>Besondere Anforderungen</label><textarea value={data.besondere_anforderungen} onChange={e => set('besondere_anforderungen', e.target.value)} className={inputCls + ' min-h-[80px]'} placeholder="Optional" /></div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Gehalt</label>
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" value={data.gehalt_von} onChange={e => set('gehalt_von', e.target.value)} className={inputCls} placeholder="Von" />
                  <input type="number" value={data.gehalt_bis} onChange={e => set('gehalt_bis', e.target.value)} className={inputCls} placeholder="Bis" />
                  <select value={data.gehalt_typ} onChange={e => set('gehalt_typ', e.target.value)} className={selectCls}>
                    {['Brutto monatlich', 'Brutto jährlich', 'Netto'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div><label className={labelCls}>Anstellungsart</label>
                <select value={data.anstellungsart} onChange={e => set('anstellungsart', e.target.value)} className={selectCls}>
                  <option value="">Bitte wählen</option>
                  {['Vollzeit', 'Teilzeit', 'Minijob', 'Befristet', 'Saisonal', 'Freiberuflich'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Arbeitszeiten</label><input value={data.arbeitszeiten} onChange={e => set('arbeitszeiten', e.target.value)} className={inputCls} placeholder="z.B. Mo–Fr 8–17 Uhr" /></div>
              <div><label className={labelCls}>Benefits</label><ChipSelect options={allBenefits} selected={data.benefits} onChange={s => set('benefits', s)} /></div>
              <div>
                <label className={labelCls}>Startdatum</label>
                <select value={data.startdatum} onChange={e => set('startdatum', e.target.value)} className={selectCls}>
                  {['Zum nächstmöglichen Zeitpunkt', 'Ab Datum', 'Flexibel'].map(o => <option key={o}>{o}</option>)}
                </select>
                {data.startdatum === 'Ab Datum' && (
                  <input type="date" value={data.startdatum_datum} onChange={e => set('startdatum_datum', e.target.value)} className={inputCls + ' mt-2'} />
                )}
              </div>
              <div><label className={labelCls}>Remote / Hybrid</label>
                <select value={data.remote} onChange={e => set('remote', e.target.value)} className={selectCls}>
                  {['Vor Ort', 'Hybrid', 'Remote möglich'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div><label className={labelCls}>Gewünschter Kampagnenstart</label><input type="date" value={data.kampagnenstart} onChange={e => set('kampagnenstart', e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Gewünschte Laufzeit</label>
                <select value={data.laufzeit} onChange={e => set('laufzeit', e.target.value)} className={selectCls}>
                  <option value="">Bitte wählen</option>
                  {['2 Wochen', '4 Wochen', '8 Wochen', 'Bis Position besetzt', 'Unsicher'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Budget-Präferenz</label>
                <select value={data.budget} onChange={e => set('budget', e.target.value)} className={selectCls}>
                  {['Standard', 'Niedrig', 'Hoch', 'Keine Präferenz'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Zielregion</label><input value={data.zielregion} onChange={e => set('zielregion', e.target.value)} className={inputCls} placeholder="z.B. Wien & Umgebung, 50km Radius" /></div>
              <div>
                <label className={labelCls}>Dringlichkeit</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {([
                    { val: 'sehr_dringend', emoji: '🔴', label: 'Sehr dringend', desc: 'Innerhalb 2 Wochen' },
                    { val: 'normal', emoji: '🟡', label: 'Normal', desc: 'Innerhalb 4–6 Wochen' },
                    { val: 'entspannt', emoji: '🟢', label: 'Entspannt', desc: 'Kein Zeitdruck' },
                  ] as const).map(d => (
                    <button key={d.val} type="button" onClick={() => set('dringlichkeit', d.val)}
                      className={`p-4 rounded-xl border text-left transition-all ${data.dringlichkeit === d.val ? 'border-[#3572E8] bg-[#3572E8]/5 ring-2 ring-[#3572E8]/20' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="text-2xl mb-1">{d.emoji}</div>
                      <div className="text-sm font-medium text-gray-900">{d.label}</div>
                      <div className="text-xs text-gray-500">{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div><label className={labelCls}>Besondere Wünsche</label><textarea value={data.besondere_wuensche} onChange={e => set('besondere_wuensche', e.target.value)} className={inputCls + ' min-h-[80px]'} placeholder="Optional" /></div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              {([
                { title: 'Stellenprofil', stepIdx: 0, items: [
                  ['Jobtitel', data.jobtitel], ['Berufsfeld', data.berufsfeld], ['Standort', data.standort],
                  ['Abteilung', data.abteilung], ['Positionen', String(data.anzahl_positionen)], ['Beschreibung', data.stellenbeschreibung],
                ]},
                { title: 'Anforderungen', stepIdx: 1, items: [
                  ['Muss-Anforderungen', data.muss_anforderungen.join(', ')], ['Kann-Anforderungen', data.kann_anforderungen.join(', ')],
                  ['Sprachkenntnisse', data.sprachkenntnisse], ['Ausbildung', data.ausbildung], ['Führerschein', data.fuehrerschein],
                  ['Schichtbereitschaft', data.schichtbereitschaft.join(', ')], ['Besondere Anforderungen', data.besondere_anforderungen],
                ]},
                { title: 'Rahmenbedingungen', stepIdx: 2, items: [
                  ['Gehalt', data.gehalt_von || data.gehalt_bis ? `${data.gehalt_von}–${data.gehalt_bis} € (${data.gehalt_typ})` : ''],
                  ['Anstellungsart', data.anstellungsart], ['Arbeitszeiten', data.arbeitszeiten], ['Benefits', data.benefits.join(', ')],
                  ['Startdatum', data.startdatum === 'Ab Datum' ? `Ab ${data.startdatum_datum}` : data.startdatum], ['Remote', data.remote],
                ]},
                { title: 'Kampagnen-Details', stepIdx: 3, items: [
                  ['Kampagnenstart', data.kampagnenstart], ['Laufzeit', data.laufzeit], ['Budget', data.budget],
                  ['Zielregion', data.zielregion],
                  ['Dringlichkeit', data.dringlichkeit === 'sehr_dringend' ? '🔴 Sehr dringend' : data.dringlichkeit === 'normal' ? '🟡 Normal' : data.dringlichkeit === 'entspannt' ? '🟢 Entspannt' : ''],
                  ['Besondere Wünsche', data.besondere_wuensche],
                ]},
              ] as const).map(section => (
                <div key={section.title}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
                    <button onClick={() => setStep(section.stepIdx)} className="text-xs text-[#3572E8] hover:underline">Bearbeiten</button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {section.items.filter(([, v]) => v).map(([label, val]) => (
                      <div key={label} className="flex text-sm">
                        <span className="text-gray-500 w-44 shrink-0">{label}</span>
                        <span className="text-gray-900">{val}</span>
                      </div>
                    ))}
                    {section.items.every(([, v]) => !v) && <p className="text-sm text-gray-400">Keine Angaben</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button onClick={() => step > 0 ? setStep(step - 1) : onClose}
            className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <ChevronLeft size={16} /> {step > 0 ? 'Zurück' : 'Abbrechen'}
          </button>
          <div className="flex gap-3">
            {step === 4 ? (
              <>
                <button onClick={() => saveToDB('entwurf')} disabled={saving}
                  className="px-5 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
                  Als Entwurf speichern
                </button>
                <button onClick={() => saveToDB('eingereicht')} disabled={saving}
                  className="px-5 py-2.5 text-sm bg-[#3572E8] text-white rounded-lg hover:bg-[#2860d0] transition-colors font-medium disabled:opacity-50">
                  Briefing absenden
                </button>
              </>
            ) : (
              <button onClick={() => setStep(step + 1)} disabled={!canNext}
                className="flex items-center gap-1 px-5 py-2.5 text-sm bg-[#3572E8] text-white rounded-lg hover:bg-[#2860d0] transition-colors font-medium disabled:opacity-50">
                Weiter <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
