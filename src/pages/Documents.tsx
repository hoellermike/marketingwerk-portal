import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { FileText, ExternalLink } from 'lucide-react'

interface Document {
  id: string
  name: string
  type: string | null
  url: string | null
  description: string | null
  created_at: string | null
}

const typeColors: Record<string, string> = {
  Report: 'bg-blue-100 text-blue-700',
  Vertrag: 'bg-purple-100 text-purple-700',
  Briefing: 'bg-orange-100 text-orange-700',
  Sonstiges: 'bg-gray-100 text-gray-600',
}

const filterOptions = ['Alle', 'Report', 'Vertrag', 'Briefing', 'Sonstiges']

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [filter, setFilter] = useState('Alle')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setDocuments(data || [])
        setLoading(false)
      })
  }, [])

  const filtered = filter === 'Alle' ? documents : documents.filter((d) => d.type === filter)

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" /></div>
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dokumente</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {filterOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Keine Dokumente vorhanden</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Typ</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">Beschreibung</th>
                <th className="px-5 py-3 font-medium">Datum</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => (
                <tr key={doc.id} className="border-b border-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{doc.name}</td>
                  <td className="px-5 py-3">
                    {doc.type && (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[doc.type] || typeColors.Sonstiges}`}>
                        {doc.type}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">{doc.description || '–'}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString('de-AT') : '–'}
                  </td>
                  <td className="px-5 py-3">
                    {doc.url && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-accent hover:text-accent/80 text-sm font-medium"
                      >
                        Öffnen <ExternalLink size={14} />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
