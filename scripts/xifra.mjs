// Ús: npm run xifra -- 10052025   (la contrasenya = la data, només els números)
// Xifra contingut.json -> src/portes.enc.json i cada fitxer de media-privat/ -> public/media/<nom>.enc
// Les fotos es redueixen a 2000px i se'ls treuen les metadades (inclosa la ubicació GPS).
import { webcrypto as c } from 'node:crypto'
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import sharp from 'sharp'

const clau = (process.argv[2] || '').replace(/\D/g, '')
if (!clau) { console.error('Ús: npm run xifra -- 10052025'); process.exit(1) }

const b64 = (u) => Buffer.from(u).toString('base64')
const salt = c.getRandomValues(new Uint8Array(16))
const km = await c.subtle.importKey('raw', new TextEncoder().encode(clau), 'PBKDF2', false, ['deriveKey'])
const k = await c.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, ['encrypt'])
const xifra = async (buf) => {
  const iv = c.getRandomValues(new Uint8Array(12))
  return { iv, ct: new Uint8Array(await c.subtle.encrypt({ name: 'AES-GCM', iv }, k, buf)) }
}

const { iv, ct } = await xifra(readFileSync('contingut.json'))
writeFileSync('src/portes.enc.json', JSON.stringify({ salt: b64(salt), iv: b64(iv), ct: b64(ct) }))
console.log('Xifrat: src/portes.enc.json')

// Mèdia: format del fitxer .enc = 12 bytes d'IV + dades xifrades
rmSync('public/media', { recursive: true, force: true })
if (existsSync('media-privat')) {
  mkdirSync('public/media', { recursive: true })
  for (const f of readdirSync('media-privat')) {
    let buf = readFileSync(`media-privat/${f}`), nom = f
    if (/\.(jpe?g|png|webp)$/i.test(f)) {
      buf = await sharp(buf).rotate().resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer()
      nom = f.replace(/\.[^.]+$/, '.jpg')
    }
    const x = await xifra(buf)
    writeFileSync(`public/media/${nom}.enc`, Buffer.concat([x.iv, x.ct]))
    console.log(`  ${nom}.enc (${Math.round(buf.length / 1024)} KB)`)
  }
}
