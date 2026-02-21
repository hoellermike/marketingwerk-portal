import { useAuth } from '../contexts/AuthContext'
import { FolderOpen, Users, Calendar, MessageSquare, ExternalLink } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface LinkCard {
  key: string
  icon: LucideIcon
  title: string
  description: string
  url: string | null | undefined
}

export default function Links() {
  const { customer } = useAuth()

  const links: LinkCard[] = [
    {
      key: 'gdrive',
      icon: FolderOpen,
      title: 'Google Drive Ordner',
      description: 'Alle Projektdateien, Reports und Unterlagen',
      url: customer?.gdrive_folder_url,
    },
    {
      key: 'leadtable',
      icon: Users,
      title: 'Bewerber-Portal',
      description: 'Lead-Tabelle mit allen Bewerbern verwalten',
      url: customer?.leadtable_url,
    },
    {
      key: 'calendly',
      icon: Calendar,
      title: 'Termin buchen',
      description: 'Meeting mit dem marketingwerk Team vereinbaren',
      url: customer?.calendly_url,
    },
    {
      key: 'slack',
      icon: MessageSquare,
      title: 'Slack Channel',
      description: 'Direkter Kommunikationskanal mit dem Team',
      url: customer?.slack_channel_url,
    },
  ]

  const visibleLinks = links.filter((l) => l.url)

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Links</h1>

      {visibleLinks.length === 0 ? (
        <div className="text-center py-20">
          <ExternalLink size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Keine Links verfügbar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleLinks.map((link) => (
            <div key={link.key} className="bg-white rounded-xl border border-gray-200 p-6 flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-lg text-accent">
                <link.icon size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{link.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{link.description}</p>
                <a
                  href={link.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent hover:text-accent/80 text-sm font-medium"
                >
                  Öffnen <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
