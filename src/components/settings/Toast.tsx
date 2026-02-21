import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from 'react'
import { CheckCircle, X } from 'lucide-react'

interface ToastCtx { toast: (msg: string) => void }
const Ctx = createContext<ToastCtx>({ toast: () => {} })
export const useToast = () => useContext(Ctx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null)

  const toast = useCallback((m: string) => {
    setMsg(m)
  }, [])

  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(null), 3000)
      return () => clearTimeout(t)
    }
  }, [msg])

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      {msg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-3 text-sm text-gray-700 animate-in">
          <CheckCircle size={18} className="text-green-500 shrink-0" />
          {msg}
          <button onClick={() => setMsg(null)} className="ml-2 text-gray-400 hover:text-gray-600"><X size={14} /></button>
        </div>
      )}
    </Ctx.Provider>
  )
}
