import { Document, Page, View, Text, StyleSheet, Svg, Path, pdf } from '@react-pdf/renderer'
import { supabase } from '../lib/supabaseClient'
import type { Faktura, FakturaRad, Fastighet, Objekt } from '../types'
import { fmt } from '../utils/format'

const AMFAST_NAMN = 'AM Fastighetsförvaltning AB'
const NAVY_DEEP = '#122437'
const MUTED = '#6b7386'
const LINE = '#dce1e8'
const INK = '#16233f'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: INK, fontFamily: 'Helvetica' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderBottomColor: LINE, paddingBottom: 12, marginBottom: 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: { fontFamily: 'Helvetica-Bold', fontSize: 16, color: NAVY_DEEP },
  titleText: { fontFamily: 'Helvetica-Bold', fontSize: 16, color: NAVY_DEEP },
  twoCol: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  label: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  metaRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 2, gap: 6 },
  metaLabel: { fontSize: 9, color: MUTED },
  metaValue: { fontSize: 9, fontFamily: 'Courier-Bold' },
  section: { marginBottom: 14 },
  tableHeaderRow: { flexDirection: 'row', borderBottom: 1.5, borderBottomColor: INK, paddingBottom: 4, marginBottom: 2 },
  tableHeaderCell: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', borderBottom: 0.5, borderBottomColor: LINE, paddingVertical: 4 },
  cellDesc: { flex: 1, fontSize: 9.5 },
  cellAmount: { width: 90, fontSize: 9.5, fontFamily: 'Courier', textAlign: 'right' },
  totalsBlock: { alignSelf: 'flex-end', marginTop: 10, width: 220 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  totalsLabel: { fontSize: 9.5, color: MUTED },
  totalsValue: { fontSize: 9.5, fontFamily: 'Courier' },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', borderTop: 1, borderTopColor: INK, paddingTop: 4, marginTop: 2 },
  sumLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold' },
  sumValue: { fontSize: 11, fontFamily: 'Courier-Bold' },
  note: { marginTop: 14, backgroundColor: '#f5f6f9', padding: 8, borderRadius: 4, fontSize: 9, color: '#3c4a68' },
  footer: { marginTop: 30, borderTop: 1, borderTopColor: LINE, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  footerCol: { fontSize: 8, color: MUTED, lineHeight: 1.5, width: '23%' },
})

function radMoms(rad: FakturaRad, objektById: Record<string, Objekt>): boolean {
  if (!rad.objekt_id) return false
  return objektById[rad.objekt_id]?.momsat ?? false
}

function AmfastLogoPdf() {
  return (
    <View style={styles.logoRow}>
      <Svg width={20} height={20} viewBox="0 0 40 40">
        <Path d="M4 34 L4 18 L12 8 L12 34" stroke={NAVY_DEEP} strokeWidth={2.4} fill="none" />
        <Path d="M12 14 L20 4 L20 34" stroke={NAVY_DEEP} strokeWidth={2.4} fill="none" />
        <Path d="M20 34 L28 20 L28 34" stroke={NAVY_DEEP} strokeWidth={2.4} fill="none" />
        <Path d="M28 34 L36 24 L36 34" stroke={NAVY_DEEP} strokeWidth={2.4} fill="none" />
        <Path d="M4 34 L36 34" stroke={NAVY_DEEP} strokeWidth={2.4} fill="none" />
      </Svg>
      <Text style={styles.logoText}>AMfast</Text>
    </View>
  )
}

export function FakturaPdfSida({
  faktura,
  rader,
  fastighet,
  objektById,
}: {
  faktura: Faktura
  rader: FakturaRad[]
  fastighet: Fastighet
  objektById: Record<string, Objekt>
}) {
  const momspliktigtBelopp = rader.filter((r) => radMoms(r, objektById)).reduce((s, r) => s + r.belopp, 0)
  const momsfrittBelopp = rader.filter((r) => !radMoms(r, objektById)).reduce((s, r) => s + r.belopp, 0)
  const totaltExklMoms = momspliktigtBelopp + momsfrittBelopp
  const moms = Math.round(momspliktigtBelopp * 0.25)
  const totaltInklMoms = totaltExklMoms + moms

  const titel =
    faktura.typ === 'kreditfaktura' ? 'Kreditfaktura' : faktura.typ === 'paminnelse' ? 'Påminnelsefaktura' : 'Hyresfaktura'
  const objektGata = faktura.objekt_id ? objektById[faktura.objekt_id]?.gata : null

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.headerRow}>
        <AmfastLogoPdf />
        <Text style={styles.titleText}>{titel}</Text>
      </View>

      <View style={styles.twoCol}>
        <View>
          <Text style={styles.label}>Fastighetsbeteckning och adress</Text>
          <Text>{fastighet.namn}</Text>
          {objektGata && <Text style={{ color: MUTED }}>{objektGata}</Text>}
        </View>
        <View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Fakturanr</Text>
            <Text style={styles.metaValue}>{faktura.fakturanummer}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Period</Text>
            <Text style={styles.metaValue}>{faktura.period}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Förfallodatum</Text>
            <Text style={styles.metaValue}>{faktura.forfallodatum}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Faktureringsadress</Text>
        <Text style={{ fontFamily: 'Helvetica-Bold' }}>{faktura.hyresgast}</Text>
        {faktura.objektnummer && <Text style={{ fontFamily: 'Courier', fontSize: 8.5, color: MUTED }}>Objekt {faktura.objektnummer}</Text>}
      </View>

      <View>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Specifikation</Text>
          <Text style={[styles.tableHeaderCell, { width: 90, textAlign: 'right' }]}>Belopp</Text>
        </View>
        {rader.map((r) => (
          <View style={styles.row} key={r.id}>
            <Text style={styles.cellDesc}>{r.beskrivning}</Text>
            <Text style={styles.cellAmount}>{fmt(r.belopp)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalsBlock}>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Totalt (exkl. moms)</Text>
          <Text style={styles.totalsValue}>{fmt(totaltExklMoms)}</Text>
        </View>
        {momspliktigtBelopp > 0 && (
          <>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Momspliktigt belopp</Text>
              <Text style={styles.totalsValue}>{fmt(momspliktigtBelopp)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Moms (25%)</Text>
              <Text style={styles.totalsValue}>{fmt(moms)}</Text>
            </View>
          </>
        )}
        <View style={styles.sumRow}>
          <Text style={styles.sumLabel}>{totaltInklMoms < 0 ? 'Att kreditera' : 'Summa att betala'}</Text>
          <Text style={styles.sumValue}>{fmt(totaltInklMoms)}</Text>
        </View>
      </View>

      {faktura.anmarkning && <Text style={styles.note}>{faktura.anmarkning}</Text>}

      <View style={styles.footer}>
        <View style={styles.footerCol}>
          <Text>{fastighet.agare ?? AMFAST_NAMN}</Text>
          {fastighet.avsandare_adress && <Text>{fastighet.avsandare_adress}</Text>}
        </View>
        <View style={styles.footerCol}>
          {fastighet.telefon && <Text>Telefon: {fastighet.telefon}</Text>}
          {fastighet.epost && <Text>E-post: {fastighet.epost}</Text>}
        </View>
        <View style={styles.footerCol}>
          {fastighet.organisationsnummer && <Text>Org.nr: {fastighet.organisationsnummer}</Text>}
          {fastighet.momsregnr && <Text>Momsreg.nr: {fastighet.momsregnr}</Text>}
        </View>
        <View style={styles.footerCol}>
          <Text>Bankgiro: {fastighet.bankgiro ?? '(anges senare)'}</Text>
          <Text>Ange fakturanummer vid betalning</Text>
        </View>
      </View>
    </Page>
  )
}

export interface FakturaPdfEntry {
  faktura: Faktura
  rader: FakturaRad[]
  fastighet: Fastighet
}

/** Genererar en PDF (en sida per faktura) och startar automatisk nedladdning i webbläsaren. */
export async function laddaNerFakturorSomPdf(entries: FakturaPdfEntry[], objektById: Record<string, Objekt>, filnamn: string) {
  const doc = (
    <Document>
      {entries.map((e) => (
        <FakturaPdfSida key={e.faktura.id} faktura={e.faktura} rader={e.rader} fastighet={e.fastighet} objektById={objektById} />
      ))}
    </Document>
  )
  const blob = await pdf(doc).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filnamn
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)

  const ids = entries.map((e) => e.faktura.id)
  await supabase.from('fakturor').update({ pdf_nedladdad_at: new Date().toISOString() }).in('id', ids)
}
