import { useMemo, useState } from 'react'

interface FaqEntry {
  fraga: string
  svar: string
  nyckelord?: string
}

const FAQ: FaqEntry[] = [
  {
    fraga: 'Hur skickar jag en avisering (avi)?',
    svar:
      'Gå till fliken "Fakturor" → "Bygg aviseringslista". Välj period, bocka i vilka fastigheter som ska ingå, klicka "Bygg lista", granska beloppen och klicka slutligen "Godkänn och skicka". En PDF med alla fakturor laddas ner automatiskt när det är klart.',
    nyckelord: 'avisera avi skicka faktura bygg lista period',
  },
  {
    fraga: 'Hur väljer jag bara vissa fastigheter när jag bygger en aviseringslista?',
    svar:
      'I "Bygg aviseringslista" finns en bockruta per fastighet ovanför listan, plus "Alla"/"Ingen" för snabbval. Bocka bara i de fastigheter du vill fakturera just nu, t.ex. bara dina egna, och bygg listan igen.',
    nyckelord: 'filtrera fastighet avisering lista välj',
  },
  {
    fraga: 'Hur laddar jag ner en faktura som PDF?',
    svar:
      'Öppna fakturan (klicka på fakturanumret eller ögat-ikonen i listan) och klicka "Ladda ner PDF". Du kan även ladda ner flera fakturor på en gång från "Skriv ut"-vyn.',
    nyckelord: 'pdf ladda ner skriv ut faktura',
  },
  {
    fraga: 'Hur ser jag om en faktura redan laddats ner, så jag inte skickar dubbelt?',
    svar:
      'En grön bock med "Nedladdad <datum/tid>" visas vid fakturor som redan laddats ner. Försöker du ladda ner igen får du en bekräftelseruta som varnar för dubbelskick.',
    nyckelord: 'dubbel nedladdad skickat två gånger',
  },
  {
    fraga: 'Hur ser jag hur många fakturor som skickades idag?',
    svar:
      'Nyckeltalskortet "Skickade idag" högst upp på fakturasidan visar antalet. Det blir grönt så fort minst en faktura är skickad idag.',
    nyckelord: 'idag skickade antal statistik',
  },
  {
    fraga: 'Hur hittar jag fakturor som skickades ett visst datum, t.ex. en tidigare dag?',
    svar:
      'Använd datumfiltret "Visa skickade" ovanför fakturalistan. Välj ett datum så visas bara de fakturor som skickades då. Klicka "Visa alla" för att återställa.',
    nyckelord: 'datum filter historik tidigare skickat',
  },
  {
    fraga: 'Hur markerar jag en faktura som betald?',
    svar: 'Klicka på bock-ikonen i fakturaraden. Ikonerna bredvid är för påminnelse och inkasso.',
    nyckelord: 'betald markera bock',
  },
  {
    fraga: 'Hur skickar jag en betalningspåminnelse?',
    svar: 'Klicka på klock/bjällre-ikonen i fakturaraden för att markera att en påminnelse skickats.',
    nyckelord: 'påminnelse betalning skicka',
  },
  {
    fraga: 'Hur skickar jag en faktura till inkasso?',
    svar: 'Klicka på varningstriangel-ikonen i fakturaraden för att markera fakturan som skickad till inkasso.',
    nyckelord: 'inkasso varning triangel',
  },
  {
    fraga: 'Jag skapade en faktura av misstag, hur tar jag bort den?',
    svar:
      'Klicka på papperskorgs-ikonen i fakturaraden och bekräfta. Detta går inte att ångra, så använd det bara vid misstag.',
    nyckelord: 'ta bort radera papperskorg misstag',
  },
  {
    fraga: 'Hur ser jag snabb information om en fastighet?',
    svar:
      'Klicka var som helst på ett fastighetskort på översiktssidan (utom på "Visa objekt →"-länken) så öppnas en popup med uthyrningsgrad, area, hyresintäkt, vakans och en lista över alla objekt/hyresgäster.',
    nyckelord: 'fastighet popup snabbvy klicka kort',
  },
  {
    fraga: 'Hur höjer jag hyran enligt index/KPI?',
    svar:
      'Gå in på fastigheten och öppna index-panelen för objektet. Där kan du beräkna och applicera uppräkning enligt vald modell (KPI, fast procent, fast belopp eller fast procent per kvartal).',
    nyckelord: 'index kpi uppräkning hyra höja',
  },
  {
    fraga: 'Vad betyder "kvartalsvis minimiökning"?',
    svar:
      'Vissa avtal har en minsta uppräkning på 0,5% per kvartal oavsett index. Systemet räknar automatiskt ut om den kvartalsvisa minimiökningen ger en högre hyra än den vanliga uppräkningen, och använder då den.',
    nyckelord: 'kvartal minimiökning 0,5 procent',
  },
  {
    fraga: 'Hur lägger jag till en ny hyresgäst eller avslutar ett hyresavtal?',
    svar:
      'Öppna objektet på fastighetssidan. Där finns knappar för att avsluta nuvarande hyresgäst och registrera en ny, samt för att förlänga ett befintligt avtal.',
    nyckelord: 'ny hyresgäst avsluta avtal förläng',
  },
  {
    fraga: 'Var ser jag drifttillägg för ett objekt?',
    svar: 'Drifttillägg visas och hanteras direkt på objektet, på fastighetens sida.',
    nyckelord: 'drifttillägg objekt',
  },
  {
    fraga: 'Hur skriver jag ut eller laddar ner flera fakturor samtidigt?',
    svar:
      'Från listan över fakturor kan du öppna "Skriv ut"-vyn för flera markerade fakturor. Där kan du både skriva ut och ladda ner alla som en samlad PDF.',
    nyckelord: 'flera samtidigt skriv ut bulk',
  },
  {
    fraga: 'Var hittar jag admin-inställningar?',
    svar:
      'Adminpanelen nås via menyn för användare med adminbehörighet. Där hanteras t.ex. användare och fastighetsbehörigheter.',
    nyckelord: 'admin inställningar behörighet',
  },
]

export function HelpAssistant() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return FAQ
    return FAQ.filter(
      (f) =>
        f.fraga.toLowerCase().includes(q) ||
        f.svar.toLowerCase().includes(q) ||
        f.nyckelord?.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Hjälp och guider"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-white shadow-card hover:bg-navy-deep"
      >
        {open ? (
          <span className="text-xl leading-none">✕</span>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 18h.01M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.9.4-1.5 1.2-1.5 2.2v.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex max-h-[75vh] w-[min(400px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card">
          <div className="border-b border-line-soft px-4 py-3">
            <div className="font-display text-[15px] font-semibold">Hjälp & guider</div>
            <div className="mt-0.5 text-[11.5px] text-muted">Sök efter det du undrar över</div>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="T.ex. avisera, pdf, betald…"
              className="mt-2 w-full rounded-lg border border-line bg-surface-sunken px-3 py-2 text-[13px] outline-none focus:border-navy"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {results.length === 0 && (
              <div className="px-3 py-6 text-center text-[12.5px] italic text-muted">
                Inga träffar. Prova ett annat sökord.
              </div>
            )}
            {results.map((f, i) => {
              const isOpen = expanded === i
              return (
                <div key={f.fraga} className="border-b border-line-soft last:border-none">
                  <button
                    onClick={() => setExpanded(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-[12.5px] font-medium hover:bg-surface-sunken"
                  >
                    <span>{f.fraga}</span>
                    <span className="text-muted">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3 text-[12.5px] leading-relaxed text-ink-soft">{f.svar}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
