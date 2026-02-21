import { Check } from 'lucide-react'
import type { JobCampaign } from '../pages/Campaigns'

interface Props {
  campaign: JobCampaign
}

const steps = [
  'Briefing erhalten',
  'Creatives in Arbeit',
  'Funnel in Erstellung',
  'Freigabe ausstehend',
  'Kampagne live',
  'Erste Bewerbungen',
  'Qualifizierung läuft',
]

function getCurrentStep(c: JobCampaign): number {
  if (c.qualified_leads > 0) return 7
  if (c.total_leads > 0) return 6
  if (c.status?.toLowerCase() === 'aktiv' || c.status?.toLowerCase() === 'active') return 5
  if (c.setup_phase === 'Freigabe ausstehend') return 4
  if (c.setup_phase === 'Funnel in Erstellung') return 3
  if (c.setup_phase === 'Creatives in Arbeit') return 2
  return 1
}

function shouldShow(c: JobCampaign): boolean {
  if (c.setup_phase) return true
  if (c.start_date) {
    const daysSinceStart = (Date.now() - new Date(c.start_date).getTime()) / 86400000
    if (daysSinceStart < 7) return true
  }
  return false
}

export default function SetupStepper({ campaign }: Props) {
  if (!shouldShow(campaign)) return null

  const current = getCurrentStep(campaign)

  return (
    <div className="bg-content-bg rounded-2xl p-4">
      <div className="flex items-center justify-between">
        {steps.map((label, i) => {
          const step = i + 1
          const done = step < current
          const active = step === current

          return (
            <div key={label} className="flex items-center flex-1 last:flex-initial">
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    done
                      ? 'bg-emerald-500 text-white'
                      : active
                      ? 'bg-accent text-white animate-pulse'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {done ? <Check size={14} /> : step}
                </div>
                <span className={`text-[9px] mt-1 text-center leading-tight max-w-[70px] ${
                  done ? 'text-emerald-600 font-medium' : active ? 'text-accent font-medium' : 'text-gray-400'
                }`}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mt-[-14px] ${done ? 'bg-emerald-400' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
