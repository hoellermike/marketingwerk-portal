import { useState } from 'react'
import { X, Download } from 'lucide-react'

interface Props {
  onClose: () => void
  onExport: (format: 'xlsx' | 'csv', hideContacts?: boolean) => void
  showPrivacy?: boolean
  title?: string
}

export default function ExportModal({ onClose, onExport, showPrivacy = false, title = 'Exportieren' }: Props) {
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx')
  const [hideContacts, setHideContacts] = useState(false)

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-xl w-full max-w-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Format</p>
              <div className="flex gap-2">
                {(['xlsx', 'csv'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`flex-1 text-sm py-2 rounded-lg border transition-colors ${
                      format === f
                        ? 'bg-[#3572E8] text-white border-[#3572E8]'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {f === 'xlsx' ? 'Excel (.xlsx)' : 'CSV (.csv)'}
                  </button>
                ))}
              </div>
            </div>

            {showPrivacy && (
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideContacts}
                  onChange={e => setHideContacts(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-[#3572E8] focus:ring-[#3572E8]"
                />
                <div>
                  <p className="text-sm text-gray-700">Kontaktdaten ausblenden</p>
                  <p className="text-xs text-gray-400">Telefon und E-Mail werden nicht exportiert (Datenschutz)</p>
                </div>
              </label>
            )}

            <button
              onClick={() => { onExport(format, hideContacts); onClose() }}
              className="w-full flex items-center justify-center gap-2 bg-[#3572E8] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#2b5ec5] transition-colors"
            >
              <Download size={14} />
              Herunterladen
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
