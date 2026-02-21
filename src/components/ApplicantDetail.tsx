import { useState } from 'react'
import { X, Star, Phone, Mail, MapPin, FileText, Download, Briefcase, GraduationCap, Calendar, Euro, Languages } from 'lucide-react'
import { mapStatus } from '../lib/statusMap'
import { formatDate } from '../lib/format'
import ApplicantFeedback from './ApplicantFeedback'
import ApplicantTimeline from './ApplicantTimeline'

export interface ApplicationDetail {
  id: string
  vorname: string | null
  nachname_initial: string | null
  status: string
  bewerbungsdatum: string
  berufserfahrung_kurz: string | null
  aktuelle_position: string | null
  ausbildung: string | null
  fruehester_start: string | null
  gehaltsvorstellung: string | null
  sprachen: string | null
  qualifikations_score: number | null
  kontaktdaten_freigeben: boolean
  telefon: string | null
  email: string | null
  wohnort: string | null
  mw_einschaetzung: string | null
  funnel_antworten: Record<string, string> | null
  dokumente_urls: string[] | null
  kunden_interesse: string | null
  kunden_rating: number | null
  kunden_feedback_positiv: string | null
  kunden_feedback_negativ: string | null
  naechster_schritt: string | null
  feedback_datum: string | null
  job_campaigns?: { jobtitel: string } | null
}

interface Props {
  application: ApplicationDetail
  onClose: () => void
  onUpdate: () => void
}

const tabs = ['Profil', 'Dokumente', 'Feedback', 'Verlauf'] as const
type Tab = typeof tabs[number]

export default function ApplicantDetail({ application: app, onClose, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('Profil')
  const status = mapStatus(app.status)
  const name = `${app.vorname || 'Bewerber'}${app.nachname_initial ? ` ${app.nachname_initial}.` : ''}`

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-[520px] bg-white z-50 shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="px-6 py-5 border-b border-card-border shrink-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-gray-900">{name}</h2>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${status.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {app.job_campaigns?.jobtitel && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-kpi-blue text-blue-700">{app.job_campaigns.jobtitel}</span>
                )}
                <span className="text-xs text-gray-400">Beworben am {formatDate(app.bewerbungsdatum)}</span>
              </div>
              {app.qualifikations_score && (
                <div className="flex gap-0.5 mt-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} size={14} className={n <= app.qualifikations_score! ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                  ))}
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 -mb-5 pb-0">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab
                    ? 'text-accent border-b-2 border-accent'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === 'Profil' && <ProfileTab app={app} />}
          {activeTab === 'Dokumente' && <DocumentsTab urls={app.dokumente_urls} />}
          {activeTab === 'Feedback' && (
            <ApplicantFeedback application={app} onFeedbackSaved={onUpdate} />
          )}
          {activeTab === 'Verlauf' && <ApplicantTimeline applicationId={app.id} />}
        </div>
      </div>
    </>
  )
}

function ProfileTab({ app }: { app: ApplicationDetail }) {
  return (
    <div className="space-y-6">
      {/* Kontaktdaten */}
      {app.kontaktdaten_freigeben && (app.telefon || app.email || app.wohnort) && (
        <Section title="Kontaktdaten">
          {app.telefon && (
            <a href={`tel:${app.telefon}`} className="flex items-center gap-2 text-sm text-accent hover:underline">
              <Phone size={14} /> {app.telefon}
            </a>
          )}
          {app.email && (
            <a href={`mailto:${app.email}`} className="flex items-center gap-2 text-sm text-accent hover:underline">
              <Mail size={14} /> {app.email}
            </a>
          )}
          {app.wohnort && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin size={14} className="text-gray-400" /> {app.wohnort}
            </div>
          )}
        </Section>
      )}

      {/* Kurzprofil */}
      <Section title="Kurzprofil">
        {app.berufserfahrung_kurz && <ProfileRow icon={Briefcase} label="Berufserfahrung" value={app.berufserfahrung_kurz} />}
        {app.aktuelle_position && <ProfileRow icon={Briefcase} label="Aktuelle Position" value={app.aktuelle_position} />}
        {app.ausbildung && <ProfileRow icon={GraduationCap} label="Ausbildung" value={app.ausbildung} />}
        {app.fruehester_start && <ProfileRow icon={Calendar} label="Frühester Start" value={app.fruehester_start} />}
        {app.gehaltsvorstellung && <ProfileRow icon={Euro} label="Gehaltsvorstellung" value={app.gehaltsvorstellung} />}
        {app.sprachen && <ProfileRow icon={Languages} label="Sprachen" value={app.sprachen} />}
      </Section>

      {/* MW Einschätzung */}
      {app.mw_einschaetzung && (
        <div className="bg-kpi-blue rounded-2xl p-4 border border-blue-200/50">
          <p className="text-xs font-semibold text-blue-700 mb-1">marketingwerk-Einschätzung</p>
          <p className="text-sm text-gray-700">{app.mw_einschaetzung}</p>
        </div>
      )}

      {/* Funnel-Antworten */}
      {app.funnel_antworten && Object.keys(app.funnel_antworten).length > 0 && (
        <Section title="Funnel-Antworten">
          {Object.entries(app.funnel_antworten).map(([q, a]) => (
            <div key={q} className="space-y-0.5">
              <p className="text-xs font-medium text-gray-500">{q}</p>
              <p className="text-sm text-gray-900">{a}</p>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

function DocumentsTab({ urls }: { urls: string[] | null }) {
  if (!urls || urls.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm text-gray-400">Noch keine Dokumente vorhanden.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {urls.map((url, i) => {
        const filename = url.split('/').pop()?.split('?')[0] || `Dokument ${i + 1}`
        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl border border-card-border hover:border-accent/40 hover:shadow-sm transition-all"
          >
            <div className="p-2 rounded-lg bg-red-50 text-red-500">
              <FileText size={16} />
            </div>
            <span className="text-sm text-gray-900 flex-1 truncate">{filename}</span>
            <Download size={14} className="text-gray-400" />
          </a>
        )
      })}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

function ProfileRow({ icon: Icon, label, value }: { icon: typeof Briefcase; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className="text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-[10px] text-gray-400">{label}</p>
        <p className="text-sm text-gray-900">{value}</p>
      </div>
    </div>
  )
}
