import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'

interface Props {
  creativeUrls: string[] | null
  headline: string | null
  primaryText: string | null
  cta: string | null
}

export default function CampaignAssets({ creativeUrls, headline, primaryText, cta }: Props) {
  const [open, setOpen] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)

  const hasCreatives = creativeUrls && creativeUrls.length > 0
  const hasText = !!primaryText || !!headline

  if (!hasCreatives && !hasText) return null

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
      >
        Anzeigen ansehen
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {/* Thumbnails */}
          {hasCreatives && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {creativeUrls!.slice(0, 4).map((url, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox(url)}
                  className="aspect-square rounded-xl overflow-hidden border border-card-border hover:opacity-90 transition-opacity"
                >
                  <img src={url} alt={`Creative ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Ad preview */}
          {hasText && (
            <div className="rounded-xl border border-card-border p-4 bg-white space-y-2">
              {headline && <p className="text-sm font-bold text-gray-900">{headline}</p>}
              {primaryText && <p className="text-xs text-gray-600 leading-relaxed">{primaryText}</p>}
              {cta && (
                <span className="inline-block text-xs font-medium bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg">
                  {cta}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-2xl max-h-[80vh]">
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-gray-600 hover:text-gray-900"
            >
              <X size={16} />
            </button>
            <img src={lightbox} alt="Creative" className="rounded-2xl max-h-[80vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}
