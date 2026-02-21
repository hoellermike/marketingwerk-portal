import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Hash } from 'lucide-react'

const LOGO_URL = 'https://raw.githubusercontent.com/hoellermike/marketingwerk-portal/refs/heads/main/med_alt2%402x.png'

const tabs = [
  { key: 'overview', label: 'Übersicht' },
  { key: 'campaigns', label: 'Kampagnen' },
  { key: 'credits', label: 'Credits & Abrechnung' },
  { key: 'resources', label: 'Ressourcen' },
] as const

export type TabKey = (typeof tabs)[number]['key']

interface Props {
  children: (activeTab: TabKey) => React.ReactNode
}

export default function Layout({ children }: Props) {
  const { user, client, signOut } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as TabKey) || 'overview'

  const setTab = (tab: TabKey) => setSearchParams({ tab })
  const initial = user?.email?.[0]?.toUpperCase() || '?'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="marketingwerk" className="h-8" />
            <span className="text-sm font-medium text-gray-400 hidden sm:block">Client Portal</span>
          </div>
          <div className="flex items-center gap-3">
            {client?.slack_channel_url && (
              <a
                href={client.slack_channel_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-accent transition-colors"
                title="Slack öffnen"
              >
                <Hash size={18} />
              </a>
            )}
            <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">
              {initial}
            </div>
            <button onClick={signOut} className="text-gray-400 hover:text-red-500 transition-colors" title="Abmelden">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-1 -mb-px overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === t.key
                    ? 'border-accent text-accent'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {children(activeTab)}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400">
        © 2026 marketingwerk · <a href="mailto:office@marketingwerk.at" className="hover:text-accent">office@marketingwerk.at</a>
      </footer>
    </div>
  )
}
