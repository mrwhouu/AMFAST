/**
 * Bygger en .eml-fil (RFC 5322/MIME) med en bilaga, som kan öppnas direkt
 * i Outlook (eller annan e-postklient) som ett färdigt, redigerbart utkast
 * — utan att kräva någon e-postserver eller tredjepartstjänst. Användaren
 * granskar och trycker själv Skicka.
 */

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.slice(result.indexOf(',') + 1))
    }
    reader.readAsDataURL(blob)
  })
}

/** Radbryter en base64-sträng till max 76 tecken per rad, som MIME kräver. */
function wrapBase64(b64: string): string {
  return b64.replace(/(.{76})/g, '$1\r\n')
}

/** RFC 2047-kodar en header (t.ex. Subject) så att å/ä/ö tolkas rätt av alla e-postklienter. */
function encodeHeaderWord(text: string): string {
  const base64 = btoa(unescape(encodeURIComponent(text)))
  return `=?UTF-8?B?${base64}?=`
}

export async function buildEml({
  to,
  subject,
  bodyText,
  attachmentFilename,
  attachmentBlob,
}: {
  to: string
  subject: string
  bodyText: string
  attachmentFilename: string
  attachmentBlob: Blob
}): Promise<Blob> {
  const boundary = `----amfast-${Math.random().toString(36).slice(2)}`
  const attachmentBase64 = wrapBase64(await blobToBase64(attachmentBlob))
  // Brödtexten base64-kodas också (istället för rå "8bit" UTF-8) — annars
  // gissar vissa e-postklienter (bl.a. Outlook, när en lokal .eml öppnas
  // direkt utanför en riktig e-postserver) fel teckenkodning och å/ä/ö
  // blir till "Ã¥/Ã¤/Ã¶"-mojibake. Base64 är entydigt och kan inte feltolkas.
  const bodyBase64 = wrapBase64(await blobToBase64(new Blob([bodyText], { type: 'text/plain' })))

  const eml = [
    `To: ${to}`,
    `Subject: ${encodeHeaderWord(subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="utf-8"',
    'Content-Transfer-Encoding: base64',
    '',
    bodyBase64,
    '',
    `--${boundary}`,
    'Content-Type: application/pdf',
    `Content-Disposition: attachment; filename="${attachmentFilename}"`,
    'Content-Transfer-Encoding: base64',
    '',
    attachmentBase64,
    '',
    `--${boundary}--`,
    '',
  ].join('\r\n')

  return new Blob([eml], { type: 'message/rfc822' })
}

export function laddaNerEml(blob: Blob, filnamn: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filnamn
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
