#!/usr/bin/env node
// Genererar supabase/seed/seed.sql från rentroll-data.json, som ett
// alternativ till import-rentroll.mjs när databasen inte kan nås direkt
// (t.ex. pga nätverksrestriktioner). Köres lokalt, ingen nätverksåtkomst
// krävs — resultatet klistras in i Supabase SQL Editor manuellt istället.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const { objects, invoices } = JSON.parse(
  readFileSync(join(__dirname, 'rentroll-data.json'), 'utf-8'),
)

const FASTIGHET_AGARE = {
  'Aeolus 1': 'Dina Palaisbacken AB',
  'Diana 2': 'Dina Försäkringar AB',
  'Juno 9': 'Dina Försäkringar AB',
}

function sqlStr(v) {
  if (v === null || v === undefined) return 'null'
  return `'${String(v).replace(/'/g, "''")}'`
}

function sqlNum(v) {
  if (v === null || v === undefined) return 'null'
  return String(v)
}

const fastighetNamn = [...new Set(objects.map((o) => o.fastighet))]

let sql = `-- Genererad av scripts/generate-seed-sql.mjs — engångsimport av rentroll-exempeldata.
-- Kör hela filen i Supabase SQL Editor (New query -> klistra in -> Run).

`

sql += `insert into public.fastigheter (namn, adress, agare, forvaltare) values\n`
sql += fastighetNamn
  .map((namn) => {
    const adress = [...new Set(objects.filter((o) => o.fastighet === namn).map((o) => o.gata))].join(' · ')
    return `  (${sqlStr(namn)}, ${sqlStr(adress)}, ${sqlStr(FASTIGHET_AGARE[namn] ?? null)}, 'AMfast Fastighetsförvaltning AB')`
  })
  .join(',\n')
sql += ';\n\n'

sql += `insert into public.objekt (fastighet_id, objektnummer, typ, hyresgast, area_kvm, kr_per_kvm, hyra_ar, fastighetsskatt_ar, ovrigt_ar, status, vakanshyra_ar, kontrakt_fran, kontrakt_tom, gata) values\n`
sql += objects
  .map((o) => {
    const fastighetIdExpr = `(select id from public.fastigheter where namn = ${sqlStr(o.fastighet)})`
    return `  (${fastighetIdExpr}, ${sqlStr(o.objekt)}, ${sqlStr(o.typ)}, ${sqlStr(o.hyresgast)}, ${sqlNum(o.area)}, ${sqlNum(o.krkvm)}, ${sqlNum(o.hyra_ar)}, ${sqlNum(o.fskat_ar ?? o.fskatt_ar)}, ${sqlNum(o.ovrigt_ar)}, ${sqlStr(o.status)}, ${sqlNum(o.vakanshyra_ar)}, ${sqlStr(o.kontrakt_from)}, ${sqlStr(o.kontrakt_tom)}, ${sqlStr(o.gata)})`
  })
  .join(',\n')
sql += ';\n\n'

sql += `insert into public.fakturor (fastighet_id, objekt_id, objektnummer, hyresgast, fakturanummer, period, forfallodatum, belopp, anmarkning) values\n`
sql += invoices
  .map((i) => {
    const fastighetIdExpr = `(select id from public.fastigheter where namn = ${sqlStr(i.fastighet)})`
    const objektIdExpr = `(select id from public.objekt where fastighet_id = ${fastighetIdExpr} and objektnummer = ${sqlStr(i.objekt)})`
    return `  (${fastighetIdExpr}, ${objektIdExpr}, ${sqlStr(i.objekt)}, ${sqlStr(i.hyresgast)}, ${sqlStr(i.fnr)}, ${sqlStr(i.period)}, ${sqlStr(i.forfallo)}, ${sqlNum(i.belopp)}, ${sqlStr(i.anm)})`
  })
  .join(',\n')
sql += ';\n'

writeFileSync(join(__dirname, '..', 'supabase', 'seed', 'seed.sql'), sql)
console.log('Skrev supabase/seed/seed.sql')
