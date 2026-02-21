import { useAuth } from '../contexts/AuthContext'
import { PlusCircle, CreditCard, Upload, Headphones, CalendarClock, Zap } from 'lucide-react'

const actions = [
  { key: 'campaign_request_url', icon: PlusCircle, title: 'Neue Kampagne', desc: 'Kampagnen-Anfrage starten' },
  { key: 'stripe_payment_link', icon: CreditCard, title: 'Credits kaufen', desc: 'Credit-Guthaben aufladen' },
  { key: 'gdrive_folder_url', icon: Upload, title: 'Assets hochladen', desc: 'Dateien im Drive ablegen' },
  { key: 'slack_channel_url', icon: Headphones, title: 'Support kontaktieren', desc: 'Direkt im Slack-Channel' },
  { key: 'calendly_url', icon: CalendarClock, title: 'Meeting buchen', desc: 'Termin mit Ihrem Team' },
] as const

export default function QuickActions() {
  const { client } = useAuth()
  if (!client) return null

  const visible = actions.filter(a => (client as any)[a.key])
  if (visible.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Zap size={18} className="text-accent" />
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.map(a => (
          <a
            key={a.key}
            href={(client as any)[a.key]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 rounded-2xl border border-card-border bg-white p-5 hover:border-accent/40 hover:shadow-md transition-all"
          >
            <div className="p-2 rounded-xl bg-kpi-blue text-accent">
              <a.icon size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{a.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
