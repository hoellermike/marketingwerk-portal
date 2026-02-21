import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from './Toast'
import { ArrowUp, ArrowDown, Lock, Plus, Trash2, Save } from 'lucide-react'

interface Status {
  id: string
  name: string
  color: string
  position: number
  is_system: boolean
  is_active: boolean
  description: string | null
}

const PRESET_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#F97316', '#F59E0B',
  '#22C55E', '#14B8A6', '#06B6D4', '#6366F1', '#A855F7', '#6B7280',
]

export default function PipelineEditor() {
  const { client } = useAuth()
  const { toast } = useToast()
  const [statuses, setStatuses] = useState<Status[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('#6B7280')
  const [showAdd, setShowAdd] = useState<number | null>(null)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6B7280')

  useEffect(() => { if (client) load() }, [client])

  async function load() {
    const { data } = await supabase
      .from('pipeline_statuses')
      .select('*')
      .eq('client_id', client!.id)
      .order('position')
    setStatuses(data || [])
    setLoading(false)
  }

  async function save() {
    for (const s of statuses) {
      await supabase.from('pipeline_statuses').update({
        name: s.name, color: s.color, position: s.position, is_active: s.is_active, updated_at: new Date().toISOString()
      }).eq('id', s.id)
    }
    toast('Pipeline gespeichert')
  }

  function move(idx: number, dir: -1 | 1) {
    const arr = [...statuses]
    const targetIdx = idx + dir
    if (targetIdx < 0 || targetIdx >= arr.length) return
    ;[arr[idx], arr[targetIdx]] = [arr[targetIdx], arr[idx]]
    arr.forEach((s, i) => s.position = i)
    setStatuses(arr)
  }

  async function addStatus(afterPosition: number) {
    if (!newName.trim() || statuses.length >= 12) return
    const { data } = await supabase.from('pipeline_statuses').insert({
      client_id: client!.id, name: newName, color: newColor, position: afterPosition + 1,
      is_system: false, is_active: true,
    }).select().single()
    if (data) {
      const arr = [...statuses]
      arr.splice(afterPosition + 1, 0, data)
      arr.forEach((s, i) => s.position = i)
      setStatuses(arr)
    }
    setNewName('')
    setNewColor('#6B7280')
    setShowAdd(null)
    toast('Status hinzugefügt')
  }

  async function remove(id: string) {
    await supabase.from('pipeline_statuses').delete().eq('id', id)
    setStatuses(statuses.filter(s => s.id !== id))
    toast('Status entfernt')
  }

  function startEdit(s: Status) {
    setEditingId(s.id)
    setEditName(s.name)
    setEditColor(s.color)
  }

  function applyEdit() {
    setStatuses(statuses.map(s => s.id === editingId ? { ...s, name: editName, color: editColor } : s))
    setEditingId(null)
  }

  if (loading) return <div className="text-gray-400 p-8">Laden...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Bewerber-Status Pipeline</h2>
          <p className="text-sm text-gray-500 mt-1">Definieren Sie die Stufen Ihres Bewerbungsprozesses</p>
        </div>
        {statuses.length >= 12 && <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">Max. 12 Status erreicht</span>}
      </div>

      <div className="space-y-1">
        {statuses.map((s, idx) => (
          <div key={s.id}>
            {/* Insert point */}
            {showAdd === idx - 1 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-1">
                <div className="flex items-center gap-3">
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Status-Name" className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#3572E8]" />
                  <div className="flex gap-1">{PRESET_COLORS.map(c => <button key={c} onClick={() => setNewColor(c)} className={`w-5 h-5 rounded-full border-2 ${newColor === c ? 'border-gray-800' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}</div>
                  <button onClick={() => addStatus(idx - 1)} className="text-xs bg-[#3572E8] text-white px-3 py-1.5 rounded-lg">Hinzufügen</button>
                  <button onClick={() => setShowAdd(null)} className="text-xs text-gray-500">Abbrechen</button>
                </div>
              </div>
            ) : (
              statuses.length < 12 && (
                <button onClick={() => { setShowAdd(idx - 1); setNewName(''); setNewColor('#6B7280') }} className="w-full flex items-center justify-center py-0.5 text-gray-300 hover:text-[#3572E8] transition-colors group">
                  <Plus size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )
            )}

            {/* Status row */}
            <div className={`flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 ${!s.is_active ? 'opacity-50' : ''}`}>
              <div className="flex flex-col gap-0.5">
                <button onClick={() => move(idx, -1)} disabled={idx === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30"><ArrowUp size={14} /></button>
                <button onClick={() => move(idx, 1)} disabled={idx === statuses.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30"><ArrowDown size={14} /></button>
              </div>
              <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              {editingId === s.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#3572E8]" />
                  <div className="flex gap-1">{PRESET_COLORS.map(c => <button key={c} onClick={() => setEditColor(c)} className={`w-4 h-4 rounded-full border-2 ${editColor === c ? 'border-gray-800' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}</div>
                  <button onClick={applyEdit} className="text-xs text-[#3572E8]">OK</button>
                </div>
              ) : (
                <span className="flex-1 text-sm font-medium text-gray-800 cursor-pointer" onClick={() => !s.is_system && startEdit(s)}>{s.name}</span>
              )}
              {s.is_system ? <Lock size={14} className="text-gray-300" /> : (
                <button onClick={() => remove(s.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={save} className="flex items-center gap-2 bg-[#3572E8] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#2860CC] transition-colors">
          <Save size={16} /> Speichern
        </button>
      </div>
    </div>
  )
}
