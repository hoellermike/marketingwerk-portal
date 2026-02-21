import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

interface Customer {
  id: string
  name: string
  package: string | null
  contact_name: string | null
  contact_email: string | null
  credits_available: number
  credits_used: number
  contract_start: string | null
  contract_end: string | null
  gdrive_folder_url: string | null
  leadtable_url: string | null
  slack_channel_url: string | null
  calendly_url: string | null
  logo_url: string | null
}

interface AuthContextType {
  session: Session | null
  user: User | null
  customer: Customer | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  customer: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCustomer = async (userId: string) => {
    const { data: portalUser } = await supabase
      .from('portal_users')
      .select('customer_id')
      .eq('id', userId)
      .single()

    if (portalUser?.customer_id) {
      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('id', portalUser.customer_id)
        .single()
      setCustomer(data)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchCustomer(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchCustomer(session.user.id).finally(() => setLoading(false))
      } else {
        setCustomer(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setCustomer(null)
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, customer, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export type { Customer }
