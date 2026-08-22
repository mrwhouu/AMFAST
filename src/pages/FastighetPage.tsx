import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { FullScreenState } from '../components/FullScreenState'
import { Hero } from '../components/Hero'
import { Tabs } from '../components/Tabs'
import { SectionLabel } from '../components/SectionLabel'
import { AlertGrid } from '../components/AlertGrid'
import { ObjectTable } from '../components/ObjectTable'
import { InvSummary } from '../components/InvSummary'
import { InvoiceGroups } from '../components/InvoiceGroups'
import { useFastighetData } from '../hooks/useFastighetData'
import { useAccess } from '../hooks/useAccess'
import { aggregate } from '../utils/aggregate'
import { buildAlerts } from '../utils/alerts'
import { ObjektFormModal } from '../components/ObjektFormModal'
import { NyHyresgastModal } from '../components/NyHyresgastModal'

const TABS = [
  { key: 'oversikt', label: 'Översikt' },
  { key: 'objekt', label: 'Objekt & kontrakt' },
  { key: 'fakturor', label: 'Fakturor' },
  { key: 'atgarder', label: 'Åtgärder' },
]

export function FastighetPage() {
  const { id } = useParams<{ id: string }>()
  const { fastighet, objekt, fakturor, drifttillagg, loading, error, reload } = useFastighetData(id)
  const { canWrite } = useAccess()
  const [tab, setTab] = useState('oversikt')
  const [showNew, setShowNew] = useState(false)
  const [showNyHyresgast, setShowNyHyresgast] = useState(false)

  const drifttillaggByObjekt = useMemo(() => {
    const map: Record<string, typeof drifttillagg> = {}
    for (const d of drifttillagg) (map[d.objekt_id] ??= []).push(d)
    return map
  }, [drifttillagg])

  const drifttillaggSummaByObjekt = useMemo(() => {
    const map: Record<string, number> = {}
    for (const d of drifttillagg) map[d.objekt_id] = (map[d.objekt_id] ?? 0) + d.belopp_ar
    return map
  }, [drifttillagg])

  const agg = useMemo(() => aggregate(objekt, drifttillaggSummaByObjekt), [objekt, drifttillaggSummaByObjekt])
  const alerts = useMemo(() => buildAlerts(objekt, fakturor), [objekt, fakturor])
  const fastighetNamnById = useMemo(
    () => (fastighet ? { [fastighet.id]: fastighet.namn } : {}),
    [fastighet],
  )

  if (loading) return <FullScreenState label="Laddar fastighet…" />
  if (error || !fastighet)
    return (
      <Layout>
        <div className="mt-10 rounded-card border border-wine-soft bg-wine-soft px-5 py-4 text-wine">
          {error ?? 'Fastigheten hittades inte, eller så saknar du åtkomst.'}
        </div>
        <Link to="/" className="mt-4 inline-block text-sm font-semibold text-navy">
          ← Till portföljöversikt
        </Link>
      </Layout>
    )

  const streets = [...new Set(objekt.map((o) => o.gata).filter(Boolean))].join(' · ')

  return (
    <Layout>
      <Link to="/" className="mb-4 inline-block text-[12.5px] font-semibold text-navy hover:text-gold">
        ← Till portföljöversikt
      </Link>

      <Hero
        eyebrow={`AMfast · ${fastighet.forvaltare}`}
        title={fastighet.namn}
        sub={`${fastighet.agare ?? ''}${streets ? ' — ' + streets : ''}`}
        agg={agg}
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'oversikt' && (
        <div>
          <SectionLabel>Kräver uppmärksamhet</SectionLabel>
          <AlertGrid data={alerts} />
        </div>
      )}

      {tab === 'objekt' && (
        <div>
          {canWrite(fastighet.id) && (
            <div className="mb-3.5 flex justify-end gap-2">
              <button
                onClick={() => setShowNew(true)}
                className="rounded-full border border-line px-4 py-2 text-[12.5px] font-semibold text-ink-soft hover:border-navy"
              >
                + Nytt objekt (manuellt)
              </button>
              <button
                onClick={() => setShowNyHyresgast(true)}
                className="rounded-full bg-navy px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-navy-deep"
              >
                + Lägg till hyresgäst
              </button>
            </div>
          )}
          <ObjectTable
            objekt={objekt}
            drifttillaggByObjekt={drifttillaggByObjekt}
            canWrite={canWrite}
            onChanged={reload}
          />
        </div>
      )}

      {tab === 'fakturor' && (
        <div>
          <InvSummary fakturor={fakturor} />
          <SectionLabel>Per hyresgäst</SectionLabel>
          <InvoiceGroups
            fakturor={fakturor}
            fastighetNamnById={fastighetNamnById}
            canWrite={canWrite}
            onChanged={reload}
          />
        </div>
      )}

      {tab === 'atgarder' && <AlertGrid data={alerts} />}

      {showNew && (
        <ObjektFormModal
          fastighetId={fastighet.id}
          onClose={() => setShowNew(false)}
          onSaved={() => {
            setShowNew(false)
            reload()
          }}
        />
      )}

      {showNyHyresgast && (
        <NyHyresgastModal
          fastighetId={fastighet.id}
          onClose={() => setShowNyHyresgast(false)}
          onSaved={() => {
            setShowNyHyresgast(false)
            reload()
          }}
        />
      )}
    </Layout>
  )
}
