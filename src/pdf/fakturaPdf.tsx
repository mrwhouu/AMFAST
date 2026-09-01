import { Document, Page, View, Text, StyleSheet, Svg, Path, pdf } from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'
import { supabase } from '../lib/supabaseClient'
import type { Faktura, FakturaRad, Fastighet, Objekt } from '../types'
import { fmt } from '../utils/format'
import { toIsoDate } from '../utils/avisering'
import { erReferensRader } from '../utils/fakturaVisning'

const AMFAST_NAMN = 'AM Fastighetsförvaltning AB'
const NAVY_DEEP = '#122437'
const MUTED = '#6b7386'
const LINE = '#dce1e8'
const INK = '#16233f'
const WINE = '#8e2a3b'

// Fönsterkuvert (DIN 5008-standard): fönstret sitter 45–92mm från papprets
// överkant och 20mm från vänsterkanten. Sidan har därför ingen egen padding
// — innehållet ovanför/under fönstret hanteras av topContent/bottomContent,
// och adressen läggs som ett eget, absolut positionerat block exakt i
// fönsterzonen, oberoende av hur mycket text som finns ovanför.
const WINDOW_TOP = '45mm'
const WINDOW_LEFT = '20mm'
const WINDOW_WIDTH = '85mm'
const CONTENT_SIDE_PADDING = 40

const styles = StyleSheet.create({
  page: { padding: 0, fontSize: 10, color: INK, fontFamily: 'Helvetica' },
  topContent: { paddingTop: 32, paddingHorizontal: CONTENT_SIDE_PADDING },
  bottomContent: { marginTop: '68mm', paddingHorizontal: CONTENT_SIDE_PADDING, paddingBottom: 40 },
  windowAddress: { position: 'absolute', top: WINDOW_TOP, left: WINDOW_LEFT, width: WINDOW_WIDTH },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderBottomColor: LINE, paddingBottom: 12, marginBottom: 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: { fontFamily: 'Helvetica-Bold', fontSize: 16, color: NAVY_DEEP },
  titleText: { fontFamily: 'Helvetica-Bold', fontSize: 16, color: NAVY_DEEP },
  twoCol: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  label: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  metaRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 2, gap: 6 },
  metaLabel: { fontSize: 9, color: MUTED },
  metaValue: { fontSize: 9, fontFamily: 'Courier-Bold' },
  section: { marginBottom: 10 },
  tableHeaderRow: { flexDirection: 'row', borderBottom: 1.5, borderBottomColor: INK, paddingBottom: 3, marginBottom: 1 },
  tableHeaderCell: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', borderBottom: 0.5, borderBottomColor: LINE, paddingVertical: 3 },
  cellObjekt: { width: 55, fontSize: 8.5, fontFamily: 'Courier', color: MUTED },
  cellTyp: { width: 65, fontSize: 8.5, color: MUTED },
  cellDesc: { flex: 1, fontSize: 9.5 },
  cellDescNotering: { flex: 1, fontSize: 8.5, fontStyle: 'italic', color: MUTED },
  cellAmount: { width: 90, fontSize: 9.5, fontFamily: 'Courier', textAlign: 'right' },
  totalsBlock: { alignSelf: 'flex-end', marginTop: 8, width: 220 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 1.5 },
  totalsLabel: { fontSize: 9.5, color: MUTED },
  totalsValue: { fontSize: 9.5, fontFamily: 'Courier' },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', borderTop: 1, borderTopColor: INK, paddingTop: 3, marginTop: 2 },
  sumLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold' },
  sumValue: { fontSize: 11, fontFamily: 'Courier-Bold' },
  note: { marginTop: 10, backgroundColor: '#f5f6f9', padding: 6, borderRadius: 4, fontSize: 9, color: '#3c4a68' },
  footer: { marginTop: 18, borderTop: 1.5, borderTopColor: INK, paddingTop: 8 },
  footerCols: { flexDirection: 'row', justifyContent: 'space-between' },
  footerCol: { fontSize: 8, color: MUTED, lineHeight: 1.4, maxWidth: '26%' },
  footerLabel: { fontSize: 8, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  payBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f5f6f9',
    borderRadius: 4,
  },
  payBoxTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  payBoxSenderCol: { fontSize: 8, color: MUTED, lineHeight: 1.3, maxWidth: '38%' },
  payBoxRow: { flexDirection: 'row', marginBottom: 1.5 },
  payBoxLabel: { fontSize: 8, color: MUTED, width: 90 },
  payBoxValue: { fontSize: 8.5, fontFamily: 'Courier-Bold' },
  refBox: {
    marginTop: 3,
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 2,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  refValue: { fontSize: 13, fontFamily: 'Courier-Bold' },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: 1,
    borderTopColor: LINE,
    paddingTop: 6,
    marginTop: 6,
  },
  bottomRowText: { fontSize: 8.5 },
  footerNote: { marginTop: 6, fontSize: 7.5, fontStyle: 'italic', color: MUTED },
})

function AddressLines({ text, style }: { text: string; style?: Style }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <Text key={i} style={style}>
          {line}
        </Text>
      ))}
    </>
  )
}

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
  const objektForFaktura = faktura.objekt_id ? objektById[faktura.objekt_id] : null
  const objektGata = objektForFaktura?.gata ?? null
  const faktureringsadress = objektForFaktura?.faktureringsadress ?? null
  const referensRader = erReferensRader(faktureringsadress)

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.topContent}>
        <View style={styles.headerRow}>
          <AmfastLogoPdf />
          <Text style={styles.titleText}>{titel}</Text>
        </View>
      </View>

      {/* Mottagaradress i fönsterkuvertets fönster — se WINDOW_*-konstanterna ovan. */}
      <View style={styles.windowAddress}>
        <Text style={{ fontFamily: 'Helvetica-Bold' }}>{faktura.hyresgast}</Text>
        {faktureringsadress ? (
          <AddressLines text={faktureringsadress} style={{ color: MUTED }} />
        ) : (
          <Text style={{ fontSize: 8.5, fontStyle: 'italic', color: WINE }}>
            Ingen faktureringsadress angiven — kan ej postas
          </Text>
        )}
      </View>

      <View style={styles.bottomContent}>
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
              <Text style={styles.metaLabel}>Datum</Text>
              <Text style={styles.metaValue}>{toIsoDate(new Date(faktura.created_at))}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Hyresperiod</Text>
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
          {faktureringsadress && <AddressLines text={faktureringsadress} style={{ color: MUTED }} />}
          {faktura.objektnummer && <Text style={{ fontFamily: 'Courier', fontSize: 8.5, color: MUTED }}>Objekt {faktura.objektnummer}</Text>}
        </View>

        {referensRader.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Er referens</Text>
            <AddressLines text={referensRader.join('\n')} style={{ fontFamily: 'Courier' }} />
          </View>
        )}

        <View>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, styles.cellObjekt]}>Objekt</Text>
            <Text style={[styles.tableHeaderCell, styles.cellTyp]}>Typ</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Specifikation</Text>
            <Text style={[styles.tableHeaderCell, { width: 90, textAlign: 'right' }]}>Belopp</Text>
          </View>
          {rader.map((r, i) => {
            const forstaRadForObjekt = rader.findIndex((x) => x.objekt_id === r.objekt_id) === i
            const objektInfo = r.objekt_id ? objektById[r.objekt_id] : null
            const arNotering = r.typ === 'index'
            return (
              <View style={styles.row} key={r.id}>
                <Text style={styles.cellObjekt}>{forstaRadForObjekt ? objektInfo?.objektnummer : ''}</Text>
                <Text style={styles.cellTyp}>{forstaRadForObjekt ? objektInfo?.typ : ''}</Text>
                <Text style={arNotering ? styles.cellDescNotering : styles.cellDesc}>{r.beskrivning}</Text>
                <Text style={styles.cellAmount}>{arNotering ? '' : fmt(r.belopp)}</Text>
              </View>
            )
          })}
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

        {faktura.anmarkning && (
          <View>
            <Text style={styles.label}>Meddelande</Text>
            <Text style={styles.note}>{faktura.anmarkning}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.footerCols}>
            <View style={styles.footerCol}>
              <Text style={{ color: INK }}>{fastighet.agare ?? AMFAST_NAMN}</Text>
              {fastighet.avsandare_adress && <AddressLines text={fastighet.avsandare_adress} />}
            </View>
            <View style={styles.footerCol}>
              <Text style={styles.footerLabel}>Telefon/E-post</Text>
              {fastighet.telefon && <Text>{fastighet.telefon}</Text>}
              {fastighet.epost && <Text>{fastighet.epost}</Text>}
            </View>
            <View style={styles.footerCol}>
              <Text style={styles.footerLabel}>Momsreg.nr</Text>
              <Text style={{ color: INK, marginBottom: 4 }}>{fastighet.momsregnr ?? '—'}</Text>
              <Text style={styles.footerLabel}>Org.nr</Text>
              <Text style={{ color: INK }}>{fastighet.organisationsnummer ?? '—'}</Text>
            </View>
            <View style={styles.footerCol}>
              <Text style={styles.footerLabel}>Bankgiro</Text>
              <Text style={{ color: INK }}>{fastighet.bankgiro ?? '(anges senare)'}</Text>
            </View>
          </View>

          <View style={styles.payBox} wrap={false}>
            <Text style={[styles.footerLabel, { marginBottom: 6 }]}>Inbetalning</Text>
            <View style={styles.payBoxTop}>
              <View style={styles.payBoxSenderCol}>
                <Text style={styles.footerLabel}>Betalningsavsändare</Text>
                <Text style={{ fontFamily: 'Helvetica-Bold', color: INK }}>{faktura.hyresgast}</Text>
                {faktureringsadress && <AddressLines text={faktureringsadress} />}
              </View>
              <View>
                <View style={styles.payBoxRow}>
                  <Text style={styles.payBoxLabel}>Fakturanummer</Text>
                  <Text style={styles.payBoxValue}>{faktura.fakturanummer}</Text>
                </View>
                <View style={styles.payBoxRow}>
                  <Text style={styles.payBoxLabel}>Förfallodatum</Text>
                  <Text style={styles.payBoxValue}>{faktura.forfallodatum}</Text>
                </View>
                {faktura.objektnummer && (
                  <View style={styles.payBoxRow}>
                    <Text style={styles.payBoxLabel}>Objektnummer</Text>
                    <Text style={styles.payBoxValue}>{faktura.objektnummer}</Text>
                  </View>
                )}
                <View style={styles.payBoxRow}>
                  <Text style={styles.payBoxLabel}>Hyresperiod</Text>
                  <Text style={styles.payBoxValue}>{faktura.period}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.footerLabel}>Referens vid betalning</Text>
                <View style={styles.refBox}>
                  <Text style={styles.refValue}>{faktura.fakturanummer}</Text>
                </View>
              </View>
            </View>

            <View style={styles.bottomRow}>
              <Text style={styles.bottomRowText}>
                <Text style={{ color: MUTED }}>Till bankgironr </Text>
                <Text style={{ fontFamily: 'Courier-Bold' }}>{fastighet.bankgiro ?? '(anges senare)'}</Text>
              </Text>
              <Text style={styles.bottomRowText}>
                <Text style={{ color: MUTED }}>Betalningsmottagare </Text>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>{fastighet.agare ?? AMFAST_NAMN}</Text>
              </Text>
            </View>
          </View>

          <Text style={styles.footerNote}>Ange alltid fakturanumret som referens vid betalning.</Text>
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
