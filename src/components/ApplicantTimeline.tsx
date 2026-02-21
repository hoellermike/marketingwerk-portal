import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Send, UserCheck, FileText, MessageSquare, Star, Clock, ArrowRight } from 'lucide-react'

interface ActivityItem {
  id: string
  event_type: string
  description: string
  created_at: string
}

interface Message {
  id: string
  sender_type: string // 'client' | 'agency'
  sender_name: string | null
  content: string
  created_at: string
}

interface Props {
  applicationId: string
}

const eventIcons: Record<string, { icon: typeof Send; bg: string; text: string }> = {
  status_change: { icon: ArrowRight, bg: 'bg-gray-50', text: 'text-blue-600' },
  feedback:      { icon: Star, bg: 'bg-gray-50', text: 'text-amber-600' },
  document:      { icon: FileText, bg: 'bg-gray-50', text: 'text-emerald-600' },
  interview:     { icon: UserCheck, bg: 'bg-gray-50', text: 'text-purple-600' },
  message:       { icon: MessageSquare, bg: 'bg-gray-100', text: 'text-gray-600' },
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

export default function ApplicantTimeline({ applicationId }: Props) {
  const { client } = useAuth()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    supabase
      .from('activity_log')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setActivities(data || []))

    supabase
      .from('messages')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setMessages(data || []))
  }, [applicationId])

  async function sendMessage() {
    if (!comment.trim() || !client) return
    setSending(true)
    const { data, error } = await supabase.from('messages').insert({
      application_id: applicationId,
      client_id: client.id,
      sender_type: 'client',
      sender_name: client.name,
      content: comment.trim(),
    }).select().single()
    setSending(false)
    if (!error && data) {
      setMessages(prev => [data, ...prev])
      setComment('')
    }
  }

  // Merge activities and messages into unified timeline
  type TimelineItem = { type: 'activity'; data: ActivityItem } | { type: 'message'; data: Message }
  const timeline: TimelineItem[] = [
    ...activities.map(a => ({ type: 'activity' as const, data: a })),
    ...messages.map(m => ({ type: 'message' as const, data: m })),
  ].sort((a, b) => new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime())

  return (
    <div className="flex flex-col h-full">
      {/* Comment input */}
      <div className="flex gap-2 mb-4">
        <input
          value={comment}
          onChange={e => setComment(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Kommentar schreiben…"
          className="flex-1 text-sm rounded-xl border border-gray-100 px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-[#3572E8]"
        />
        <button
          onClick={sendMessage}
          disabled={!comment.trim() || sending}
          className="px-3 py-2.5 bg-[#3572E8] text-white rounded-xl hover:bg-[#3572E8]/90 transition-colors disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </div>

      {/* Timeline */}
      {timeline.length === 0 ? (
        <div className="text-center py-8">
          <Clock size={24} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">Noch keine Einträge</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto flex-1">
          {timeline.map(item => {
            if (item.type === 'message') {
              const msg = item.data
              const isClient = msg.sender_type === 'client'
              return (
                <div key={`msg-${msg.id}`} className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
                    isClient ? 'bg-[#3572E8] text-white' : 'bg-gray-100 text-gray-900'
                  }`}>
                    {!isClient && msg.sender_name && (
                      <p className="text-[10px] font-medium text-gray-500 mb-0.5">{msg.sender_name}</p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${isClient ? 'text-white/60' : 'text-gray-400'}`}>
                      {relativeTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              )
            }

            const act = item.data
            const { icon: Icon, bg, text } = eventIcons[act.event_type] || eventIcons.message
            return (
              <div key={`act-${act.id}`} className="flex gap-3 items-start">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                  <Icon size={14} className={text} />
                </div>
                <div>
                  <p className="text-sm text-gray-700">{act.description}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{relativeTime(act.created_at)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
