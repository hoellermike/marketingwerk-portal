import { useAuth } from '../contexts/AuthContext'
import { FolderOpen, Hash, LayoutList, CalendarClock, PlusCircle, FileText, PenLine, Link } from 'lucide-react'
import AccountTeam from '../components/AccountTeam'

export default function Resources() {
  const { client } = useAuth()
  if (!client) return null

  const tools = [
    { url: client.gdrive_folder_url, icon: FolderOpen, title: 'Google Drive', desc: 'Gemeinsamer Dateiordner' },
    { url: client.slack_channel_url, icon: Hash, title: 'Slack', desc: 'Direkter Kommunikationskanal' },
    { url: client.asana_project_url, icon: LayoutList, title: 'Asana', desc: 'Projektmanagement' },
    { url: client.calendly_url, icon: CalendarClock, title: 'Meeting buchen', desc: 'Termin vereinbaren' },
  ].filter(t => t.url)

  const forms = [
    { url: client.campaign_request_url, icon: PlusCircle, title: 'Neue Kampagne', desc: 'Kampagnen-Anfrage starten' },
    { url: client.quote_request_url, icon: FileText, title: 'Angebot anfordern', desc: 'Individuelles Angebot' },
    { url: client.change_request_url, icon: PenLine, title: 'Änderungswunsch', desc: 'Änderung einreichen' },
  ].filter(f => f.url)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ressourcen</h1>
        <p className="text-sm text-gray-500 mt-1">Alle Links, Tools und Formulare an einem Ort.</p>
      </div>

      {tools.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Link size={18} className="text-accent" />
            <h2 className="text-lg font-semibold text-gray-900">Links & Tools</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tools.map(t => (
              <a
                key={t.title}
                href={t.url!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-card-border bg-white p-5 hover:border-accent/40 hover:shadow-md transition-all"
              >
                <div className="p-2 rounded-xl bg-kpi-blue text-accent">
                  <t.icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {forms.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText size={18} className="text-accent" />
            <h2 className="text-lg font-semibold text-gray-900">Formulare</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {forms.map(f => (
              <a
                key={f.title}
                href={f.url!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-card-border bg-white p-5 hover:border-accent/40 hover:shadow-md transition-all"
              >
                <div className="p-2 rounded-xl bg-kpi-purple text-purple-600">
                  <f.icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{f.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <AccountTeam />
    </div>
  )
}
