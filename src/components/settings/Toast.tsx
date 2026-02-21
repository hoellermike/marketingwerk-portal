// Shim: delegates to global ToastContext for backward compat
import { type ReactNode, useMemo } from 'react'
import { useToast as useGlobalToast } from '../../contexts/ToastContext'

export function useToast() {
  const { showToast } = useGlobalToast()
  return useMemo(() => ({ toast: (msg: string) => showToast(msg, 'success') }), [showToast])
}

/** No-op wrapper kept so Settings.tsx compiles without changes */
export function ToastProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
