import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { FullScreenState } from '../components/FullScreenState'
import { Tabs } from '../components/Tabs'
import { FastighetFormModal } from '../components/FastighetFormModal'
import { useAdminData } from '../hooks/useAdminData'
import { supabase } from '../lib/supabaseClient'
import type { Fastighet, Role } from '../types'

const TABS = [
  { key: 'fastigheter', label: 'Fastigheter' },
  { key: 'anvandare', label: 'Användare & åtkomst' },
]

const ROLES: Role[] = ['admin', 'forvaltare', 'agare', 'viewer']

export function AdminPage() {
  const { fastigheter, profiles, access, loading, error, reload } = useAdminData()
  const [tab, setTab] = useState('fastigheter')
  const [editing, setEditing] = useState<Fastighet | null>(null)
  const [creating, setCreating] = useState(false)

  if (loading) return <FullScreenState label="Laddar admin…" />

  async function deleteFastighet(f: Fastighet) {
    if (!confirm(`Ta bort ${f.namn}? Detta tar även bort alla dess objekt och fakturor.`)) return
    const { error } = await supabase.from('fastigheter').delete().eq('id', f.id)
    if (error) alert(error.message)
    else reload()
  }

  async function setRole(userId: string, role: Role) {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
    if (error) alert(error.message)
    else reload()
  }

  async function toggleAccess(userId: string, fastighetId: string, current?: 'read' | 'write') {
    if (!current) {
      const { error } = await supabase
        .from('anvandare_fastighet')
        .insert({ user_id: userId, fastighet_id: fastighetId, behorighet: 'read' })
      if (error) alert(error.message)
    } else if (current === 'read') {
      const { error } = await supabase
        .from('anvandare_fastighet')
        .update({ behorighet: 'write' })
        .eq('user_id', userId)
        .eq('fastighet_id', fastighetId)
      if (error) alert(error.message)
    } else {
      const { error } = await supabase
        .from('anvandare_fastighet')
        .delete()
        .eq('user_id', userId)
        .eq('fastighet_id', fastighetId)
      if (error) alert(error.message)
    }
    reload()
  }

  return (
    <Layout>
      <Link to="/" className="mb-4 mt-6 inline-block text-[12.5px] font-semibold text-navy hover:text-gold">
        ← Till portföljöversikt
      </Link>
      <h1 className="mb-1 font-display text-2xl font-semibold">Admin</h1>
      <p className="mb-2 text-sm text-muted">Hantera fastigheter, objekt och vilka användare som har åtkomst.</p>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {error && (
        <div className="mb-4 rounded-card border border-wine-soft bg-wine-soft px-5 py-3 text-wine">{error}</div>
      )}

      {tab === 'fastigheter' && (
        <div>
          <div className="mb-3.5 flex justify-end">
            <button
              onClick={() => setCreating(true)}
              className="rounded-full bg-navy px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-navy-deep"
            >
              + Ny fastighet
            </button>
          </div>
          <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
            <table className="w-full border-collapse text-[12.8px]">
              <thead>
                <tr>
                  {['Namn', 'Adress', 'Ägare', 'Förvaltare', ''].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap border-b border-line bg-surface-sunken px-3.5 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fastigheter.map((f) => (
                  <tr key={f.id} className="border-b border-line-soft last:border-none hover:bg-[#FAFBFD]">
                    <td className="px-3.5 py-2.5 font-semibold">{f.namn}</td>
                    <td className="px-3.5 py-2.5">{f.adress ?? '—'}</td>
                    <td className="px-3.5 py-2.5">{f.agare ?? '—'}</td>
                    <td className="px-3.5 py-2.5">{f.forvaltare}</td>
                    <td className="space-x-3 px-3.5 py-2.5 text-right">
                      <button
                        onClick={() => setEditing(f)}
                        className="text-[11.5px] font-semibold text-navy hover:text-gold"
                      >
                        Redigera
                      </button>
                      <button
                        onClick={() => deleteFastighet(f)}
                        className="text-[11.5px] font-semibold text-wine hover:text-wine/70"
                      >
                        Ta bort
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'anvandare' && (
        <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
          <table className="w-full border-collapse text-[12.8px]">
            <thead>
              <tr>
                <th className="whitespace-nowrap border-b border-line bg-surface-sunken px-3.5 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-muted">
                  Användare
                </th>
                <th className="whitespace-nowrap border-b border-line bg-surface-sunken px-3.5 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-muted">
                  Roll
                </th>
                {fastigheter.map((f) => (
                  <th
                    key={f.id}
                    className="whitespace-nowrap border-b border-line bg-surface-sunken px-3.5 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-muted"
                  >
                    {f.namn}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-b border-line-soft last:border-none hover:bg-[#FAFBFD]">
                  <td className="px-3.5 py-2.5 font-semibold">{p.full_name ?? p.id}</td>
                  <td className="px-3.5 py-2.5">
                    <select
                      value={p.role}
                      onChange={(e) => setRole(p.id, e.target.value as Role)}
                      className="input !w-auto"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  {fastigheter.map((f) => {
                    const rec = access.find((a) => a.user_id === p.id && a.fastighet_id === f.id)
                    return (
                      <td key={f.id} className="px-3.5 py-2.5">
                        <button
                          onClick={() => toggleAccess(p.id, f.id, rec?.behorighet)}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            rec?.behorighet === 'write'
                              ? 'bg-green-soft text-green'
                              : rec?.behorighet === 'read'
                                ? 'bg-amber-soft text-amber'
                                : 'bg-surface-sunken text-muted'
                          }`}
                          title="Klicka för att växla: ingen → read → write → ingen"
                        >
                          {rec?.behorighet ?? 'ingen'}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(editing || creating) && (
        <FastighetFormModal
          fastighet={editing}
          onClose={() => {
            setEditing(null)
            setCreating(false)
          }}
          onSaved={() => {
            setEditing(null)
            setCreating(false)
            reload()
          }}
        />
      )}
    </Layout>
  )
}
