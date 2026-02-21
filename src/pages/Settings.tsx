import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GitBranch, Mail, Zap, Clock, Bell, Users, Settings as SettingsIcon, ArrowLeft, LogOut } from 'lucide-react'
import { ToastProvider } from '../components/settings/Toast'
import PipelineEditor from '../components/settings/PipelineEditor'
import EmailTemplates from '../components/settings/EmailTemplates'
import Automations from '../components/settings/Automations'
import Reminders from '../components/settings/Reminders'
import Notifications from '../components/settings/Notifications'
import TeamAccess from '../components/settings/TeamAccess'
import GeneralSettings from '../components/settings/GeneralSettings'
import { usePageTitle } from '../lib/usePageTitle'

const CATEGORIES = [
  { key: 'pipeline', label: 'Bewerber-Status', icon: GitBranch },
  { key: 'email-templates', label: 'E-Mail-Vorlagen', icon: Mail },
  { key: 'automations', label: 'Automationen', icon: Zap },
  { key: 'reminders', label: 'Erinnerungen', icon: Clock },
  { key: 'notifications', label: 'Benachrichtigungen', icon: Bell },
  { key: 'team', label: 'Team & Zugriff', icon: Users },
  { key: 'general', label: 'Allgemein', icon: SettingsIcon },
] as const

type Category = (typeof CATEGORIES)[number]['key']

const LOGO_URL = 'https://raw.githubusercontent.com/hoellermike/marketingwerk-portal/refs/heads/main/med_alt2%402x.png'

export default function Settings() {
  const { category } = useParams<{ category?: string }>()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const active = (category as Category) || 'pipeline'
  usePageTitle('settings')

  const initial = user?.email?.[0]?.toUpperCase() || '?'

  function renderContent() {
    switch (active) {
      case 'pipeline': return <PipelineEditor />
      case 'email-templates': return <EmailTemplates />
      case 'automations': return <Automations />
      case 'reminders': return <Reminders />
      case 'notifications': return <Notifications />
      case 'team': return <TeamAccess />
      case 'general': return <GeneralSettings />
    }
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside className="w-[260px] shrink-0 bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-40 flex flex-col">
          <div className="px-5 py-5 flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600">
              <ArrowLeft size={18} />
            </button>
            <img src={LOGO_URL} alt="marketingwerk" className="h-7" />
          </div>

          <div className="px-3 mt-2">
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Einstellungen</p>
            <nav className="space-y-0.5">
              {CATEGORIES.map(cat => {
                const isActive = active === cat.key
                return (
                  <button
                    key={cat.key}
                    onClick={() => navigate(`/settings/${cat.key}`)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-[#3572E8] font-medium border-l-2 border-[#3572E8] -ml-[2px]'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <cat.icon size={18} />
                    {cat.label}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="flex-1" />

          <div className="px-3 pb-5">
            <div className="flex items-center gap-3 px-3 py-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold shrink-0">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-700 truncate">{user?.email}</p>
              </div>
              <button onClick={signOut} className="text-gray-400 hover:text-gray-600"><LogOut size={16} /></button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 ml-[260px] p-8 max-w-4xl">
          {renderContent()}
        </main>
      </div>
    </ToastProvider>
  )
}
