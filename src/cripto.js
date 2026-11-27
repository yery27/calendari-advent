import { useEffect, useState } from 'react'
import enc from './portes.enc.json'

const d = (s) => Uint8Array.from(atob(s), (x) => x.charCodeAt(0))
let clau // clau AES derivada de la data; es calcula una sola vegada
const tipus = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', mp3: 'audio/mpeg', m4a: 'audio/mp4', mp4: 'video/mp4', pdf: 'application/pdf' }

// Torna el contingut de les portes, o llança error si la contrasenya no és bona.
export async function desxifra(pwd) {
  const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(pwd.replace(/\D/g, '')), 'PBKDF2', false, ['deriveKey'])
  const k = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: d(enc.salt), iterations: 100000, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, ['decrypt'])
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: d(enc.iv) }, k, d(enc.ct))
  clau = k // només si ha descifrat bé
  return JSON.parse(new TextDecoder().decode(pt))
}

// Baixa public/media/<nom>.enc, el descifra i en fa una URL local (blob:)
const cau = new Map()
export function media(nom) {
  if (!cau.has(nom)) {
    // ?v= canvia cada cop que es xifra de nou, així el navegador mai barreja arxius vells (en caché) amb el codi nou
    cau.set(nom, fetch(`${import.meta.env.BASE_URL}media/${nom}.enc?v=${enc.salt.replace(/\W/g, '').slice(0, 12)}`).then(async (r) => {
      if (!r.ok) throw new Error(nom)
      const b = new Uint8Array(await r.arrayBuffer())
      const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b.slice(0, 12) }, clau, b.slice(12))
      return URL.createObjectURL(new Blob([pt], { type: tipus[nom.split('.').pop().toLowerCase()] || 'application/octet-stream' }))
    }))
  }
  return cau.get(nom)
}

export function useMedia(nom) {
  const [r, setR] = useState({})
  useEffect(() => {
    let viu = true
    setR({})
    if (nom) media(nom).then((url) => viu && setR({ url })).catch(() => viu && setR({ err: true }))
    return () => { viu = false }
  }, [nom])
  return r
}
