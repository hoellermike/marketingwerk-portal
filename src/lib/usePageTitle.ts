import { useEffect } from 'react'

const titles: Record<string, string> = {
  overview: 'Dashboard — marketingwerk Portal',
  campaigns: 'Kampagnen — marketingwerk Portal',
  applicants: 'Bewerber — marketingwerk Portal',
  credits: 'Credits — marketingwerk Portal',
  resources: 'Ressourcen — marketingwerk Portal',
  settings: 'Einstellungen — marketingwerk Portal',
}

export function usePageTitle(key: string) {
  useEffect(() => {
    document.title = titles[key] || 'marketingwerk Portal'
  }, [key])
}
