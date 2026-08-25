import { useMemo, useState } from 'react'
import { Layout } from '../components/Layout'
import { FullScreenState } from '../components/FullScreenState'
import { Hero } from '../components/Hero'
import { Tabs } from '../components/Tabs'
import { PropertyCard } from '../components/PropertyCard'
import { SectionLabel } from '../components/SectionLabel'
import { AlertGrid } from '../components/AlertGrid'
import { FilterBar } from '../components/FilterBar'
import { ObjectTable } from '../components/ObjectTable'
import { InvSummary } from '../components/InvSummary'
import { InvoiceGroups } from '../components/InvoiceGroups'
import { IndexPanel } from '../components/IndexPanel'
import { AviseringView } from '../components/AviseringView'
import { usePortfolioData } from '../hooks/usePortfolioData'
import { useAccess } from '../hooks/useAccess'
import { aggregate } from '../utils/aggregate'
import { buildAlerts } from '../utils/alerts'

const BAS_TABS = [
  { key: 'oversikt', label: 'Översikt' },
  { key: 'objekt', label: 'Objekt & kontrakt' },
  { key: 'fakturor', label: 'Fakturor' },
  { key: 'atgarder', label: 'Åtgärder' },
]
const AVISERING_TAB = { key: 'avisering', label: 'Avisering' }

export function DashboardPage() {
  const { fastigheter, objekt, fakturor, drifttillagg, loading, error, reload } = usePortfolioData()
  const { canWrite, hasAnyWrite } = useAccess()
  const [tab, setTab] = useState('oversikt')
  const [filter, setFilter] = useState('alla')
  const [search, setSearch] = useState('')

  const objektByFastighet = useMemo(() => {
    const map = new Map<string, typeof objekt>()
    for (const f of fastigheter) map.set(f.id, [])
    for (const o of objekt) map.get(o.fastighet_id)?.push(o)
    return map
  }, [fastigheter, objekt])

  const fastighetNamnById = useMemo(
    () => Object.fromEntries(fastigheter.map((f) => [f.id, f.namn])),
    [fastigheter],
  )

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

  const totalAgg = useMemo(() => aggregate(objekt, drifttillaggSummaByObjekt), [objekt, drifttillaggSummaByObjekt])
  const alerts = useMemo(() => buildAlerts(objekt, fakturor), [objekt, fakturor])

  const filteredObjekt = useMemo(() => {
    const s = search.toLowerCase()
    return objekt.filter((o) => {
      const fMatch = filter === 'alla' || fastighetNamnById[o.fastighet_id] === filter
      const sMatch =
        !s ||
        o.objektnummer.toLowerCase().includes(s) ||
        (o.hyresgast ?? '').toLowerCase().includes(s) ||
        o.typ.toLowerCase().includes(s)
      return fMatch && sMatch
    })
  }, [objekt, filter, search, fastighetNamnById])

  if (loading) return <FullScreenState label="Laddar portföljdata…" />
  if (error)
    return (
      <Layout>
        <div className="mt-10 flex items-center justify-between gap-4 rounded-card border border-wine-soft bg-wine-soft px-5 py-4 text-wine">
          <span>Kunde inte hämta data: {error}</span>
          <button
            onClick={reload}
            className="whitespace-nowrap rounded-full border border-wine px-4 py-1.5 text-[12.5px] font-semibold hover:bg-wine hover:text-white"
          >
            Försök igen
          </button>
        </div>
      </Layout>
    )

  const ownerNames = [...new Set(fastigheter.map((f) => f.agare).filter(Boolean))]
  const streetNames = [...new Set(objekt.map((o) => o.gata).filter(Boolean))]
  const tabs = hasAnyWrite ? [...BAS_TABS, AVISERING_TAB] : BAS_TABS

  return (
    <Layout>
      <Hero
        eyebrow="AMfast · Portföljöversikt"
        title="Portföljöversikt"
        sub={`${fastigheter.map((f) => f.namn).join(', ')} — ${streetNames.slice(0, 4).join(' / ')}. Förvaltas av AMfast Fastighetsförvaltning AB${ownerNames.length ? ' för ' + ownerNames.join(' och ') : ''}.`}
        agg={totalAgg}
      />

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'oversikt' && (
        <div>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {fastigheter.map((f, i) => (
              <PropertyCard
                key={f.id}
                fastighet={f}
                objekt={objektByFastighet.get(f.id) ?? []}
                drifttillaggSummaByObjekt={drifttillaggSummaByObjekt}
                colorIndex={i}
              />
            ))}
          </div>
          <SectionLabel>Kräver uppmärksamhet</SectionLabel>
          <AlertGrid data={alerts} canWrite={canWrite} onChanged={reload} />
        </div>
      )}

      {tab === 'objekt' && (
        <div>
          {hasAnyWrite && <IndexPanel objekt={objekt} onApplied={reload} />}
          <FilterBar
            fastigheter={fastigheter}
            active={filter}
            onChange={setFilter}
            search={search}
            onSearch={setSearch}
          />
          <ObjectTable
            objekt={filteredObjekt}
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

      {tab === 'atgarder' && <AlertGrid data={alerts} canWrite={canWrite} onChanged={reload} />}

      {tab === 'avisering' && hasAnyWrite && (
        <AviseringView
          objekt={objekt}
          drifttillaggSummaByObjekt={drifttillaggSummaByObjekt}
          fastighetNamnById={fastighetNamnById}
          canWrite={canWrite}
          onCreated={reload}
        />
      )}
    </Layout>
  )
}
