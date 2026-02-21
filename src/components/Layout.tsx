import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard,
  Megaphone,
  FileText,
  LinkIcon,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/campaigns', label: 'Kampagnen', icon: Megaphone },
  { to: '/documents', label: 'Dokumente', icon: FileText },
  { to: '/links', label: 'Links', icon: LinkIcon },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { customer, signOut } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/10">
        {customer?.logo_url ? (
          <img src={customer.logo_url} alt="Logo" className="h-8" />
        ) : (
          <span className="text-xl font-bold text-white">marketingwerk</span>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        {customer && (
          <p className="text-xs text-white/40 mb-3 truncate">{customer.name}</p>
        )}
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors w-full"
        >
          <LogOut size={18} />
          Abmelden
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 bg-navy flex-shrink-0">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-navy">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} className="text-gray-700" />
          </button>
          <span className="font-semibold text-navy">marketingwerk</span>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
