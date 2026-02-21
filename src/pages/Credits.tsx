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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KPICard label="Verfügbare Credits" value={formatNumber(client.credits_available)} icon={CreditCard} highlighted />
        <KPICard label="Verbraucht gesamt" value={formatNumber(client.credits_used)} icon={TrendingDown} />
        <KPICard label="Credit-Info" value="1 Credit = 1 Kampagnen-Tag" icon={Info} />
      </div>

      {txns.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Transaktionsverlauf</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                  <th className="px-4 py-3 font-medium">Datum</th>
                  <th className="px-4 py-3 font-medium">Beschreibung</th>
                  <th className="px-4 py-3 font-medium text-center">Typ</th>
                  <th className="px-4 py-3 font-medium text-right">Credits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {txns.map(t => {
                  const isCredit = t.type === 'credit' || t.amount > 0
                  return (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{formatDate(t.date)}</td>
                      <td className="px-4 py-3 text-gray-900">{t.description}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          isCredit ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {isCredit ? 'Gutschrift' : 'Verbrauch'}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
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
