import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Shield, ToggleLeft, ToggleRight, Send, RefreshCw } from 'lucide-react'

interface WebhookEntry {
  id: string
  event_type: string
  webhook_url: string
  is_active: boolean
  description: string | null
  last_triggered_at: string | null
  created_at: string
}

function maskUrl(url: string): string {
  try {
    const u = new URL(url)
    const path = u.pathname
    return u.origin + path.slice(0, 8) + '•••' + path.slice(-4)
  } catch {
    return url.slice(0, 20) + '•••'
  }
}

export default function WebhookStatus() {
  const [hooks, setHooks] = useState<WebhookEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [testingId, setTestingId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('webhook_config').select('*').order('event_type')
    setHooks(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggle(id: string, current: boolean) {
    await supabase.from('webhook_config').update({ is_active: !current }).eq('id', id)
    setHooks(prev => prev.map(h => h.id === id ? { ...h, is_active: !current } : h))
  }

  async function sendTest(hook: WebhookEntry) {
    if (hook.webhook_url.includes('PLACEHOLDER')) {
      alert('Webhook URL ist noch ein Platzhalter. Bitte zuerst eine echte Make.com URL eintragen.')
      return
    }
    setTestingId(hook.id)
    try {
      await fetch(hook.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: hook.event_type,
          test: true,
          timestamp: new Date().toISOString(),
          message: 'Test-Webhook vom marketingwerk Portal',
        }),
      })
      alert('Test-Payload gesendet!')
    } catch {
      alert('Fehler beim Senden. Prüfe die URL und CORS-Einstellungen.')
    }
    setTestingId(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="text-indigo-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">Webhook-Konfiguration</h1>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Admin</span>
          <button onClick={load} className="ml-auto p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Event</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Beschreibung</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">URL</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Letzter Aufruf</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Aktiv</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Test</th>
              </tr>
            </thead>
            <tbody>
              {hooks.map(h => (
                <tr key={h.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-mono text-xs text-indigo-700">{h.event_type}</td>
                  <td className="px-4 py-3 text-gray-600">{h.description || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{maskUrl(h.webhook_url)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {h.last_triggered_at ? new Date(h.last_triggered_at).toLocaleString('de-AT') : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggle(h.id, h.is_active)} className="inline-flex">
                      {h.is_active
                        ? <ToggleRight size={24} className="text-green-500" />
                        : <ToggleLeft size={24} className="text-gray-300" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => sendTest(h)}
                      disabled={testingId === h.id}
                      className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors text-indigo-500 disabled:opacity-50"
                    >
                      <Send size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
