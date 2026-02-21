import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { ArrowLeft } from 'lucide-react'

export default function Profile() {
  const { user, signOut } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.user_metadata?.full_name || user?.email?.split('@')[0] || '')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  const email = user?.email || ''
  const loginDate = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '–'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#3572E8] mb-2">
          <ArrowLeft size={16} /> Zurück zum Dashboard
        </button>

        <h1 className="text-2xl font-bold text-gray-900">Mein Profil</h1>

        {/* Personal Data */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Persönliche Daten</h2>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3572E8]" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">E-Mail</label>
            <input value={email} disabled
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Rolle</label>
            <p className="text-sm text-gray-700">Admin <span className="text-gray-400">(nicht änderbar)</span></p>
          </div>
          <button onClick={() => showToast('Profil gespeichert', 'success')}
            className="bg-[#3572E8] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#2860CC] transition-colors">
            Speichern
          </button>
        </div>

        {/* Password */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Passwort ändern</h2>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Aktuelles Passwort</label>
            <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3572E8]" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Neues Passwort</label>
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3572E8]" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Passwort bestätigen</label>
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3572E8]" />
          </div>
          <button onClick={() => { showToast('Passwort geändert', 'success'); setCurrentPw(''); setNewPw(''); setConfirmPw('') }}
            className="bg-[#3572E8] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#2860CC] transition-colors">
            Passwort ändern
          </button>
        </div>

        {/* Session */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Sitzung</h2>
          <p className="text-sm text-gray-600">Angemeldet seit: <span className="font-medium text-gray-900">{loginDate}</span></p>
          <button onClick={signOut}
            className="border border-red-200 text-red-600 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
            Abmelden
          </button>
        </div>
      </div>
    </div>
  )
}
