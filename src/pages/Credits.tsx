import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { CreditCard, TrendingDown, Info } from 'lucide-react'
import KPICard from '../components/KPICard'
import { formatNumber, formatDate } from '../lib/format'

interface CreditTransaction {
  id: string
  description: string
  type: string
  amount: number
  date: string
}

export default function Credits() {
  const { client } = useAuth()
  const [txns, setTxns] = useState<CreditTransaction[]>([])

  useEffect(() => {
    if (!client) return
    supabase
      .from('credit_transactions')
      .select('*')
      .eq('client_id', client.id)
      .order('date', { ascending: false })
      .then(({ data }) => setTxns(data || []))
  }, [client])

  if (!client) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Credits & Abrechnung</h1>
        <p className="text-sm text-gray-500 mt-1">Ihr Credit-Guthaben und alle Transaktionen im Überblick.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KPICard label="Verfügbare Credits" value={formatNumber(client.credits_available)} icon={CreditCard} tint="gold" />
        <KPICard label="Verbraucht gesamt" value={formatNumber(client.credits_used)} icon={TrendingDown} tint="peach" />
        <KPICard label="Credit-Info" value="1 Credit = 1 Tag" icon={Info} tint="blue" subtitle="1 Credit = 1 Kampagnen-Tag" />
      </div>

      {txns.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Transaktionsverlauf</h2>
          <div className="bg-white rounded-2xl border border-card-border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border text-left text-xs text-gray-500">
                  <th className="px-5 py-3.5 font-medium">Datum</th>
                  <th className="px-5 py-3.5 font-medium">Beschreibung</th>
                  <th className="px-5 py-3.5 font-medium text-center">Typ</th>
                  <th className="px-5 py-3.5 font-medium text-right">Credits</th>
                </tr>
              </thead>
              <tbody>
                {txns.map(t => {
                  const isCredit = t.type === 'credit' || t.amount > 0
                  return (
                    <tr key={t.id} className="hover:bg-content-bg/50 transition-colors">
                      <td className="px-5 py-3.5 text-gray-500">{formatDate(t.date)}</td>
                      <td className="px-5 py-3.5 text-gray-900">{t.description}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          isCredit ? 'text-emerald-700' : 'text-red-600'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${isCredit ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {isCredit ? 'Gutschrift' : 'Verbrauch'}
                        </span>
                      </td>
                      <td className={`px-5 py-3.5 text-right font-medium ${isCredit ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isCredit ? '+' : ''}{formatNumber(t.amount)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
