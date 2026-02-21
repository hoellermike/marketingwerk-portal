import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

export interface Client {
  id: string
  name: string
  slug: string | null
  status: string
  branche: string | null
  website: string | null
  ansprache: string
  credits_available: number
  credits_used: number
  gdrive_folder_url: string | null
  slack_channel_url: string | null
  slack_channel_id: string | null
  asana_project_url: string | null
  calendly_url: string | null
  stripe_payment_link: string | null
  campaign_request_url: string | null
  quote_request_url: string | null
  change_request_url: string | null
  logo_url: string | null
  account_owner: string
  onboarding_date: string | null
}

interface AuthContextType {
  session: Session | null
  user: User | null
  client: Client | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  client: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchClient = async (userId: string) => {
    const { data: portalUser } = await supabase
      .from('portal_users')
      .select('client_id')
      .eq('id', userId)
      .single()

    if (portalUser?.client_id) {
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('id', portalUser.client_id)
        .single()
      setClient(data)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchClient(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchClient(session.user.id).finally(() => setLoading(false))
      } else {
        setClient(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setClient(null)
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, client, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
