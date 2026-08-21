#!/usr/bin/env node
// Engångsskript: importerar rentroll-data (från referensprototypens inbäddade
// JSON) till Supabase. Kräver SUPABASE_URL och SUPABASE_SERVICE_ROLE_KEY
// (service role-nyckeln kringgår RLS och ska ALDRIG användas i frontend/webbläsaren
// — kör bara detta skript lokalt/i CI).
//
// Körs t.ex. med:
//   node --env-file=.env.import scripts/import-rentroll.mjs

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Saknar SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Sätt dem i miljön, t.ex. via ett .env.import\n' +
      '(kör sedan: node --env-file=.env.import scripts/import-rentroll.mjs).',
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const { objects, invoices } = JSON.parse(
  readFileSync(join(__dirname, 'rentroll-data.json'), 'utf-8'),
)

const FASTIGHET_AGARE = {
  'Aeolus 1': 'Dina Palaisbacken AB',
  'Diana 2': 'Dina Försäkringar AB',
  'Juno 9': 'Dina Försäkringar AB',
}

async function main() {
  const fastighetNamn = [...new Set(objects.map((o) => o.fastighet))]

  console.log(`Skapar/uppdaterar ${fastighetNamn.length} fastigheter…`)
  const fastighetIdByNamn = {}
  for (const namn of fastighetNamn) {
    const adress = [...new Set(objects.filter((o) => o.fastighet === namn).map((o) => o.gata))].join(' · ')
    const { data: existing } = await supabase
      .from('fastigheter')
      .select('id')
      .eq('namn', namn)
      .maybeSingle()

    if (existing) {
      fastighetIdByNamn[namn] = existing.id
      continue
    }

    const { data, error } = await supabase
      .from('fastigheter')
      .insert({
        namn,
        adress,
        agare: FASTIGHET_AGARE[namn] ?? null,
        forvaltare: 'AMfast Fastighetsförvaltning AB',
      })
      .select('id')
      .single()

    if (error) throw error
    fastighetIdByNamn[namn] = data.id
  }

  console.log(`Skapar/uppdaterar ${objects.length} objekt…`)
  const objektIdByNummer = {}
  for (const o of objects) {
    const fastighet_id = fastighetIdByNamn[o.fastighet]
    const payload = {
      fastighet_id,
      objektnummer: o.objekt,
      typ: o.typ,
      hyresgast: o.hyresgast,
      area_kvm: o.area,
      kr_per_kvm: o.krkvm,
      hyra_ar: o.hyra_ar,
      fastighetsskatt_ar: o.fskatt_ar,
      ovrigt_ar: o.ovrigt_ar,
      status: o.status,
      vakanshyra_ar: o.vakanshyra_ar,
      kontrakt_fran: o.kontrakt_from,
      kontrakt_tom: o.kontrakt_tom,
      gata: o.gata,
    }

    const { data, error } = await supabase
      .from('objekt')
      .upsert(payload, { onConflict: 'fastighet_id,objektnummer' })
      .select('id, objektnummer')
      .single()

    if (error) throw error
    objektIdByNummer[data.objektnummer] = data.id
  }

  console.log(`Skapar/uppdaterar ${invoices.length} fakturor…`)
  for (const i of invoices) {
    const fastighet_id = fastighetIdByNamn[i.fastighet]
    // Fakturor kan avse flera objekt ("851-1001/1002/1009") eller objekt som
    // saknas i rentrollen — koppla objekt_id bara när det är en entydig träff.
    const objekt_id = objektIdByNummer[i.objekt] ?? null

    const payload = {
      fastighet_id,
      objekt_id,
      objektnummer: i.objekt,
      hyresgast: i.hyresgast,
      fakturanummer: i.fnr,
      period: i.period,
      forfallodatum: i.forfallo,
      belopp: i.belopp,
      anmarkning: i.anm,
    }

    const { error } = await supabase
      .from('fakturor')
      .upsert(payload, { onConflict: 'fastighet_id,fakturanummer' })

    if (error) throw error
  }

  console.log('Klart! Importerade fastigheter, objekt och fakturor.')
}

main().catch((err) => {
  console.error('Import misslyckades:', err)
  process.exit(1)
})
