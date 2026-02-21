import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, LayoutDashboard, Megaphone, Users, CreditCard, FolderOpen, Menu, X, Settings } from 'lucide-react'
import NotificationBell from './NotificationBell'

const LOGO_URL = 'https://raw.githubusercontent.com/hoellermike/marketingwerk-portal/refs/heads/main/med_alt2%402x.png'

const navItems = [
  { key: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'campaigns', label: 'Kampagnen', icon: Megaphone },
  { key: 'applicants', label: 'Bewerber', icon: Users },
  { key: 'credits', label: 'Credits', icon: CreditCard },
  { key: 'resources', label: 'Ressourcen', icon: FolderOpen },
] as const

export type TabKey = (typeof navItems)[number]['key']

interface Props {
  children: (activeTab: TabKey) => React.ReactNode
}

export default function Layout({ children }: Props) {
  const { user, signOut } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const activeTab = (searchParams.get('tab') as TabKey) || 'overview'

  const setTab = (tab: TabKey) => {
    setSearchParams({ tab })
    setSidebarOpen(false)
  }

  const initial = user?.email?.[0]?.toUpperCase() || '?'
  const email = user?.email || ''

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5">
        <img src={LOGO_URL} alt="marketingwerk" className="h-8 brightness-0 invert" />
      </div>

      {/* Navigation */}
      <div className="px-3 mt-4">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-navy-muted">Navigation</p>
        <nav className="space-y-1">
          {navItems.map(item => {
            const isActive = activeTab === item.key
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-navy-light text-white'
                    : 'text-navy-muted hover:bg-navy-light/50 hover:text-white'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notification Bell */}
      <div className="px-3 pb-2">
        <NotificationBell onNavigate={(tab) => setTab(tab as TabKey)} />
      </div>

      {/* Settings link */}
      <div className="px-3 pb-2">
        <a href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-navy-muted hover:bg-navy-light/50 hover:text-white transition-colors">
          <Settings size={18} />
          Einstellungen
        </a>
      </div>

      {/* User section */}
      <div className="px-3 pb-5">
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-navy-light text-white flex items-center justify-center text-xs font-bold shrink-0">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-white truncate">{email}</p>
          </div>
          <button onClick={signOut} className="text-navy-muted hover:text-red-400 transition-colors shrink-0" title="Abmelden">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[250px] shrink-0 bg-navy flex-col fixed inset-y-0 left-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[250px] bg-navy flex flex-col">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-navy-muted hover:text-white">
              <X size={20} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-[250px] flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-4 h-14 flex items-center gap-3 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
            <Menu size={22} />
          </button>
          <img src={LOGO_URL} alt="marketingwerk" className="h-7" />
        </header>

        {/* Content */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8">
          {children(activeTab)}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-100 bg-white py-4 text-center text-xs text-gray-400">
          © 2026 marketingwerk · <a href="mailto:office@marketingwerk.at" className="hover:text-[#3572E8]">office@marketingwerk.at</a>
        </footer>
      </div>
    </div>
  )
}
