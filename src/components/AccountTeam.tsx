import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Mail } from 'lucide-react'

interface Contact {
  id: string
  name: string
  role: string | null
  email: string | null
  sort_order: number
}

export default function AccountTeam() {
  const { client } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])

  useEffect(() => {
    if (!client) return
    supabase
      .from('contacts')
      .select('*')
      .eq('client_id', client.id)
      .order('sort_order')
      .then(({ data }) => setContacts(data || []))
  }, [client])

  if (contacts.length === 0) return null

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Account-Team</h3>
      <div className="space-y-3">
        {contacts.map(c => {
          const initials = c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
          return (
            <div key={c.id} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{c.name}</p>
                {c.role && <p className="text-xs text-gray-500">{c.role}</p>}
              </div>
              {c.email && (
                <a href={`mailto:${c.email}`} className="text-gray-400 hover:text-accent">
                  <Mail size={16} />
                </a>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
