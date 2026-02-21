import { useEffect, useState, useRef } from 'react'
import { Bell, Mail } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { supabase } from '../lib/supabase'

interface Notification {
  id: string
  client_id: string
  title: string
  body: string | null
  read: boolean
  link_tab: string | null
  created_at: string
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'gerade eben'
  if (mins < 60) return `vor ${mins} Min.`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `vor ${hours} Std.`
  const days = Math.floor(hours / 24)
  return `vor ${days} Tagen`
}

interface Props {
  onNavigate?: (tab: string) => void
  variant?: 'dark' | 'light'
}

export default function NotificationBell({ onNavigate, variant = 'dark' }: Props) {
  const { client } = useAuth()
  const { showToast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!client) return
    supabase
      .from('notifications')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setNotifications(data || []))
  }, [client])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  async function markRead(notif: Notification) {
    if (!notif.read) {
      await supabase.from('notifications').update({ read: true }).eq('id', notif.id)
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))
    }
    if (notif.link_tab && onNavigate) {
      onNavigate(notif.link_tab)
    }
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`relative p-2 rounded-lg transition-colors ${
          variant === 'light'
            ? 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            : 'text-navy-muted hover:bg-navy-light/50 hover:text-white'
        }`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-full ml-2 bottom-0 w-72 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Benachrichtigungen</p>
          </div>
          {/* Pending email mock */}
          <div className="px-4 py-3 border-b border-gray-100 bg-amber-50/50">
            <div className="flex items-start gap-2">
              <Mail size={14} className="text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-amber-700">1 E-Mail wartet auf Freigabe</p>
                <p className="text-xs text-gray-600 mt-0.5">Absage an Stefan M. — Chef de Rang</p>
                <button onClick={() => { showToast('E-Mail-Freigabe wird in einer zukünftigen Version verfügbar', 'info'); setOpen(false) }}
                  className="text-xs text-[#3572E8] hover:underline font-medium mt-1">Prüfen &amp; Senden</button>
              </div>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell size={24} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">Keine neuen Benachrichtigungen</p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {notifications.slice(0, 5).map(n => (
                <button
                  key={n.id}
                  onClick={() => markRead(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 ${!n.read ? 'bg-gray-50/30' : ''}`}
                >
                  <p className="text-sm text-gray-900 font-medium">{n.title}</p>
                  {n.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>}
                  <p className="text-[10px] text-gray-400 mt-1">{relativeTime(n.created_at)}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
