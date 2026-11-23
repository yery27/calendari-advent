import enc from './portes.enc.json'

const d = (s) => Uint8Array.from(atob(s), (x) => x.charCodeAt(0))

// Torna el contingut de les portes, o llança error si la contrasenya no és bona.
export async function desxifra(pwd) {
  const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(pwd.replace(/\D/g, '')), 'PBKDF2', false, ['deriveKey'])
  const k = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: d(enc.salt), iterations: 200000, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, ['decrypt'])
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: d(enc.iv) }, k, d(enc.ct))
  return JSON.parse(new TextDecoder().decode(pt))
}
