import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props { children: ReactNode }
interface State { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center max-w-sm">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-red-50 mb-4">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Etwas ist schiefgelaufen</h2>
            <p className="text-sm text-gray-500 mb-5">Ein unerwarteter Fehler ist aufgetreten.</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3572E8] text-white text-sm font-medium rounded-lg hover:bg-[#2860d0] transition-colors"
            >
              <RefreshCw size={16} /> Seite neu laden
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
