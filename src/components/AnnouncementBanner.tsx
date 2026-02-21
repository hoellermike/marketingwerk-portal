import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Megaphone } from 'lucide-react'

interface Announcement {
  id: string
  message: string
}

export default function AnnouncementBanner() {
  const { client } = useAuth()
  const [ann, setAnn] = useState<Announcement | null>(null)

  useEffect(() => {
    if (!client) return
    supabase
      .from('announcements')
      .select('id, message')
      .eq('client_id', client.id)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setAnn(data[0])
      })
  }, [client])

  if (!ann) return null

  return (
    <div className="rounded-2xl bg-kpi-blue p-5 flex items-start gap-3 shadow-sm">
      <div className="w-9 h-9 rounded-xl bg-blue-200/60 flex items-center justify-center shrink-0">
        <Megaphone size={18} className="text-accent" />
      </div>
      <p className="text-sm text-gray-800 pt-1.5">{ann.message}</p>
    </div>
  )
}
