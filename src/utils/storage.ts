import { supabase } from '../lib/supabaseClient'

/**
 * Laddar upp en fil till en privat bucket ("ritningar" eller "dokument").
 * Sökvägen måste börja med "<fastighet_id>/" — det är vad storage-policyerna
 * i migration 0006 kräver för att kunna återanvända has_fastighet_access().
 */
export async function uploadToBucket(bucket: 'ritningar' | 'dokument', fastighetId: string, file: File) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
  const path = `${fastighetId}/${crypto.randomUUID()}-${safeName}`
  const { error } = await supabase.storage.from(bucket).upload(path, file)
  if (error) throw error
  return path
}

/** Tidsbegränsad nedladdnings-/visningslänk för en fil i en privat bucket. */
export async function getSignedUrl(bucket: 'ritningar' | 'dokument', path: string, expiresInSeconds = 3600) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds)
  if (error) throw error
  return data.signedUrl
}
