import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Mail, Loader2, Lock } from 'lucide-react'

const LOGO_URL = 'https://raw.githubusercontent.com/hoellermike/marketingwerk-portal/refs/heads/main/med_alt2%402x.png'

type LoginMode = 'magic' | 'password'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<LoginMode>('password')

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)
    if (error) {
      setError(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="marketingwerk" className="h-12 mx-auto mb-3" />
          <p className="text-gray-500 mt-1">Kundenportal</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="text-green-600" size={24} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">E-Mail gesendet!</h2>
              <p className="text-gray-500 text-sm">
                Wir haben einen Magic Link an <strong>{email}</strong> gesendet.
                Bitte prüfe dein Postfach und klicke auf den Link.
              </p>
            </div>
          ) : mode === 'password' ? (
            <form onSubmit={handlePassword}>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Anmelden</h2>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail-Adresse
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@firma.at"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Passwort
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-white py-2.5 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Anmelden…
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Anmelden
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setMode('magic'); setError('') }}
                className="w-full mt-3 text-sm text-gray-500 hover:text-accent transition-colors"
              >
                Stattdessen Magic Link verwenden
              </button>
            </form>
          ) : (
            <form onSubmit={handleMagicLink}>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Anmelden</h2>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail-Adresse
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@firma.at"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-white py-2.5 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Wird gesendet…
                  </>
                ) : (
                  <>
                    <Mail size={16} />
                    Magic Link senden
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setMode('password'); setError('') }}
                className="w-full mt-3 text-sm text-gray-500 hover:text-accent transition-colors"
              >
                Stattdessen mit Passwort anmelden
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
