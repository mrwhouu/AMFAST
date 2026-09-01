/**
 * Extraherar hyresgästens egna referens-/routingrader ur en faktureringsadress
 * (t.ex. "BOB 7365591038553" eller "Serial no: 160010" + "R 061") som "Er referens".
 * Antagande: de sista två raderna är alltid den vanliga adressen (gata + postnr/ort) —
 * eventuella rader före det är hyresgästens egna kod(er), precis som i de riktiga
 * historiska Savills-fakturorna där denna typ av kod visas både i adressen och separat
 * under en egen "Er referens"-rubrik.
 */
export function erReferensRader(adress: string | null): string[] {
  if (!adress) return []
  const rader = adress.split('\n').filter((r) => r.trim().length > 0)
  return rader.length > 2 ? rader.slice(0, rader.length - 2) : []
}
