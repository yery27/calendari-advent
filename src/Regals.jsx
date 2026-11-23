import { useEffect, useRef } from 'react'
import { per, de } from './config'
import { useMedia } from './cripto'

const guarda = (blob, nom) => {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = nom
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 3000)
}
const Boto = ({ children, ...p }) => (
  <button {...p} className="w-full rounded-full bg-vermell py-3.5 font-extrabold text-crema active:scale-[.98]">{children}</button>
)
const Consell = ({ children }) => <p className="text-center text-[12px] leading-snug text-crema/50">{children}</p>

// ---- Fons de pantalla dibuixat al moment (1170x2532), amb la foto de fons si n'hi ha ----
const rng = (s) => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646

async function pinta(c, im, focus = 0.5) {
  await Promise.all(['800 120px "Bricolage Grotesque"', 'italic 400 60px "Fraunces"'].map((f) => document.fonts.load(f).catch(() => {})))
  const W = (c.width = 1170), H = (c.height = 2532), x = c.getContext('2d')
  const r = rng(5)
  if (im) {
    // Foto a pantalla completa (retallada pel costat segons `focus`), amb ombres a dalt i a baix perquè es llegeixi el rellotge i el text
    x.fillStyle = '#220609'; x.fillRect(0, 0, W, H)
    const s = Math.max(W / im.width, H / im.height), dw = im.width * s, dh = im.height * s
    x.drawImage(im, -(dw - W) * focus, -(dh - H) * 0.5, dw, dh)
    x.fillStyle = 'rgba(120,10,20,.14)'; x.fillRect(0, 0, W, H)
    let g = x.createLinearGradient(0, 0, 0, 760); g.addColorStop(0, 'rgba(34,6,9,.8)'); g.addColorStop(1, 'rgba(34,6,9,0)')
    x.fillStyle = g; x.fillRect(0, 0, W, 760)
    g = x.createLinearGradient(0, 1600, 0, H); g.addColorStop(0, 'rgba(34,6,9,0)'); g.addColorStop(1, 'rgba(34,6,9,.9)')
    x.fillStyle = g; x.fillRect(0, 1600, W, H - 1600)
  } else {
    const g = x.createRadialGradient(W / 2, 0, 0, W / 2, 0, H * 0.85)
    g.addColorStop(0, '#5a1019'); g.addColorStop(1, '#220609')
    x.fillStyle = g; x.fillRect(0, 0, W, H)
    x.fillStyle = 'rgba(244,236,225,.13)'
    for (let y = 20; y < H; y += 44) for (let i = 20; i < W; i += 44) { x.beginPath(); x.arc(i, y, 2.2, 0, 6.3); x.fill() }
  }
  // Llums desenfocades (bokeh) de fons
  const col = ['#e8453a', '#e9c46a', '#f4ece1', '#e9c46a']
  for (let i = 0; i < 16; i++) {
    const bx = r() * W, by = r() * 900, br = 40 + r() * 70, g = x.createRadialGradient(bx, by, 0, bx, by, br)
    g.addColorStop(0, col[i % 4] + '38'); g.addColorStop(1, col[i % 4] + '00')
    x.fillStyle = g; x.beginPath(); x.arc(bx, by, br, 0, 6.3); x.fill()
  }
  // Neu
  x.fillStyle = 'rgba(255,255,255,.85)'
  for (let i = 0; i < 120; i++) { x.beginPath(); x.arc(r() * W, r() * H, 2 + r() * 5, 0, 6.3); x.fill() }
  // Garlanda
  x.strokeStyle = 'rgba(233,196,106,.55)'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, 20)
  for (let i = 0; i < 12; i++) x.quadraticCurveTo(i * 97.5 + 48, 130, (i + 1) * 97.5, 20)
  x.stroke()
  for (let i = 0; i < 12; i++) {
    const bx = i * 97.5 + 48, g2 = x.createRadialGradient(bx, 80, 0, bx, 80, 44)
    g2.addColorStop(0, col[i % 4] + 'aa'); g2.addColorStop(1, col[i % 4] + '00')
    x.fillStyle = g2; x.beginPath(); x.arc(bx, 80, 44, 0, 6.3); x.fill()
    x.fillStyle = col[i % 4]; x.beginPath(); x.arc(bx, 76, 13, 0, 6.3); x.fill()
  }
  // Marc daurat
  x.strokeStyle = 'rgba(233,196,106,.6)'; x.lineWidth = 4; x.beginPath(); x.roundRect(34, 34, W - 68, H - 68, 90); x.stroke()
  // Text a la part baixa (el rellotge de la pantalla de bloqueig queda a dalt)
  x.textAlign = 'center'; x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 30
  if (im) {
    x.fillStyle = '#f4ece1'; x.font = 'italic 400 150px "Fraunces", Georgia, serif'; x.fillText('Bon Nadal', W / 2, 2060)
    x.fillStyle = '#e9c46a'; x.font = '800 60px "Bricolage Grotesque", sans-serif'; x.letterSpacing = '14px'
    x.fillText(per.toUpperCase(), W / 2 + 7, 2170); x.letterSpacing = '0px'
  } else {
    x.fillStyle = '#e9c46a'; x.font = '800 44px "Bricolage Grotesque", sans-serif'
    x.letterSpacing = '18px'; x.fillText('PER A', W / 2 + 9, 1500); x.letterSpacing = '0px'
    x.fillStyle = '#f4ece1'; x.font = '800 300px "Bricolage Grotesque", sans-serif'; x.fillText(per, W / 2, 1760)
    x.fillStyle = '#e9c46a'; x.font = 'italic 400 76px "Fraunces", Georgia, serif'; x.fillText(`Amb carinyo, ${de}`, W / 2, 1900)
  }
  x.shadowBlur = 0; x.fillStyle = '#e9c46a'; x.font = '60px serif'; x.fillText('✦', W / 2, im ? 2260 : 2040)
}

export function Fons({ text, src, focus }) {
  const ref = useRef()
  const m = useMedia(src)
  useEffect(() => {
    if (src && !m.url && !m.err) return // esperant que es descifri la foto
    let viu = true
    ;(async () => {
      let im = null
      if (m.url) { im = new Image(); im.src = m.url; await im.decode() }
      if (viu) await pinta(ref.current, im, focus)
    })()
    return () => { viu = false }
  }, [m.url, m.err])
  return (
    <div className="space-y-4">
      <canvas ref={ref} className="mx-auto h-[52dvh] max-w-full rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,.5)]" />
      {text && <p className="text-center text-[15px] text-crema/85">{text}</p>}
      <Boto onClick={() => ref.current.toBlob((b) => guarda(b, 'fons-de-nadal.png'))}>Desa el fons al mòbil</Boto>
      <Consell>Si només t’obre la imatge, mantén-la premuda i tria «Desa a Fotos». Després: Ajustos → Fons de pantalla.</Consell>
    </div>
  )
}

// ---- Plans que s'afegeixen al calendari del mòbil (.ics) ----
function ics(plans) {
  const ara = new Date().toISOString().replace(/[-:]|\.\d+/g, '')
  const ev = plans.map((p, i) => {
    const [y, m, d] = p.data.split('-'), h = (p.hora || '20:00').replace(':', '')
    return ['BEGIN:VEVENT', `UID:pla${i}-${p.data}@calendari-advent`, `DTSTAMP:${ara}`, `DTSTART:${y}${m}${d}T${h}00`, 'DURATION:PT2H',
      `SUMMARY:${p.titol}`, 'BEGIN:VALARM', 'TRIGGER:-PT12H', 'ACTION:DISPLAY', `DESCRIPTION:${p.titol}`, 'END:VALARM', 'END:VEVENT'].join('\r\n')
  })
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//calendari-advent//CA', ...ev, 'END:VCALENDAR'].join('\r\n')
}

export function Plans({ plans = [], text }) {
  return (
    <div className="space-y-4">
      {text && <p className="font-serif text-[17px] leading-relaxed text-crema/95">{text}</p>}
      <ul className="space-y-2">
        {plans.map((p, i) => (
          <li key={i} className="fila flex items-center gap-4 rounded-2xl bg-crema/10 p-3" style={{ '--i': i }}>
            <span className="grid w-14 shrink-0 place-items-center rounded-xl bg-crema py-1.5 text-vermell">
              <b className="text-2xl leading-none tracking-[-.04em]">{+p.data.split('-')[2]}</b>
              <small className="text-[10px] font-extrabold uppercase">{new Date(p.data + 'T12:00').toLocaleDateString('ca', { month: 'short' }).replace('.', '')}</small>
            </span>
            <span className="min-w-0"><span className="block font-bold">{p.titol}</span>{p.hora && <span className="text-sm text-crema/60">{p.hora}</span>}</span>
          </li>
        ))}
      </ul>
      <Boto onClick={() => guarda(new Blob([ics(plans)], { type: 'text/calendar;charset=utf-8' }), 'els-nostres-plans.ics')}>Afegeix-ho al meu calendari</Boto>
      <Consell>Se t’obrirà el calendari del mòbil amb tots els plans i un avís el dia abans.</Consell>
    </div>
  )
}

// ---- Foto o PDF per quedar-se-la ----
export function Descarrega({ src, text, boto }) {
  const { url, err } = useMedia(src)
  const img = /\.(png|jpe?g|webp)$/i.test(src)
  return (
    <div className="space-y-4">
      {err ? <div className="grid min-h-40 place-items-center rounded-2xl border border-dashed border-crema/30 p-6 text-center text-sm text-crema/60">Aquí anirà el fitxer (media-privat/{src})</div>
        : img && (url ? <img src={url} alt="" className="mx-auto max-h-[52dvh] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,.5)]" /> : <div className="mx-auto h-60 w-44 rounded-2xl bg-crema/10" />)}
      {text && <p className="text-center text-[15px] text-crema/85">{text}</p>}
      {url && <a href={url} download={src} className="block w-full rounded-full bg-vermell py-3.5 text-center font-extrabold text-crema active:scale-[.98]">{boto || 'Desa-ho al mòbil'}</a>}
      {img && <Consell>Si només t’obre la imatge, mantén-la premuda i tria «Desa a Fotos».</Consell>}
    </div>
  )
}

// ---- Cupó canviat: targeta bonica (PNG) que es descarrega al mòbil ----
function embolica(x, text, max) {
  const l = []; let a = ''
  for (const m of text.split(' ')) { const t = a ? `${a} ${m}` : m; if (x.measureText(t).width > max && a) { l.push(a); a = m } else a = t }
  if (a) l.push(a)
  return l
}

export async function desaCupo({ dia, titol, text, data, nota }) {
  await Promise.all(['800 60px "Bricolage Grotesque"', 'italic 400 60px "Fraunces"'].map((f) => document.fonts.load(f).catch(() => {})))
  // El cupó: paper cru, osques laterals, doble filet daurat, banda vermella, tisores, codi de barres i segell al taló
  const tw = 920, th = 1090, cut = 700
  const t = document.createElement('canvas'); t.width = tw; t.height = th
  const y = t.getContext('2d')
  y.fillStyle = '#f6eee2'; y.beginPath(); y.roundRect(0, 0, tw, th, 30); y.fill()
  y.globalCompositeOperation = 'destination-out'
  for (const cx of [0, tw]) { y.beginPath(); y.arc(cx, cut, 40, 0, 6.3); y.fill() }
  y.globalCompositeOperation = 'source-over'
  const or = y.createLinearGradient(0, 0, tw, th); or.addColorStop(0, '#b9852c'); or.addColorStop(0.5, '#f0d27a'); or.addColorStop(1, '#b9852c')
  y.strokeStyle = or; y.lineWidth = 5; y.beginPath(); y.roundRect(26, 26, tw - 52, th - 52, 18); y.stroke()
  y.strokeStyle = 'rgba(232,69,58,.45)'; y.lineWidth = 2; y.beginPath(); y.roundRect(40, 40, tw - 80, th - 80, 12); y.stroke()
  y.textAlign = 'center'
  // banda
  y.fillStyle = '#e8453a'; y.beginPath(); y.roundRect(70, 78, tw - 140, 100, 14); y.fill()
  y.fillStyle = '#f6eee2'; y.font = '800 50px "Bricolage Grotesque", sans-serif'; y.letterSpacing = '12px'; y.fillText('CUPÓ REGAL', tw / 2 + 6, 146); y.letterSpacing = '0px'
  y.font = '34px serif'; y.fillText('✦', 122, 142); y.fillText('✦', tw - 122, 142)
  // oferta
  y.fillStyle = '#9a6a1c'; y.font = '800 28px "Bricolage Grotesque", sans-serif'; y.letterSpacing = '12px'; if (!/^vale\b/i.test(titol.replace(/^Cupó:\s*/i, ''))) y.fillText('VALE PER', tw / 2 + 6, 245); y.letterSpacing = '0px'
  y.fillStyle = '#2b080c'; y.font = 'italic 400 72px "Fraunces", Georgia, serif'
  const tit = embolica(y, titol.replace(/^Cupó:\s*/i, ''), tw - 170).slice(0, 3)
  tit.forEach((l, i) => y.fillText(l, tw / 2, 335 + i * 84))
  const ya = 335 + (tit.length - 1) * 84 + 62
  y.fillStyle = 'rgba(43,8,12,.72)'; y.font = '400 36px "Bricolage Grotesque", sans-serif'
  embolica(y, text || '', tw - 190).slice(0, 2).forEach((l, i) => y.fillText(l, tw / 2, ya + i * 46))
  y.fillStyle = 'rgba(43,8,12,.42)'; y.font = '700 21px "Bricolage Grotesque", sans-serif'; y.letterSpacing = '2px'
  y.fillText('VÀLID PER A 1 ÚS · SENSE DATA DE CADUCITAT', tw / 2, cut - 62)
  y.fillText('NO ACUMULABLE · NO BESCANVIABLE PER DINERS', tw / 2, cut - 32); y.letterSpacing = '0px'
  // línia de tall amb tisores
  y.setLineDash([16, 12]); y.strokeStyle = 'rgba(43,8,12,.35)'; y.lineWidth = 3; y.beginPath(); y.moveTo(96, cut); y.lineTo(tw - 70, cut); y.stroke(); y.setLineDash([])
  y.fillStyle = 'rgba(43,8,12,.55)'; y.font = '44px serif'; y.textAlign = 'left'; y.fillText('✂', 60, cut + 15); y.textAlign = 'center'
  // taló: codi de barres + número de sèrie
  const rb = rng(dia * 97 + 11)
  y.fillStyle = '#2b080c'
  for (let bx = 80; bx < 440;) { const w = 2 + Math.floor(rb() * 6); y.fillRect(bx, cut + 60, w, 130); bx += w + 2 + Math.floor(rb() * 6) }
  y.font = '700 24px "Bricolage Grotesque", sans-serif'; y.letterSpacing = '5px'; y.textAlign = 'left'
  y.fillText(`N.º ${String(dia).padStart(4, '0')}  ·  ${per.toUpperCase()}`, 80, cut + 232); y.textAlign = 'center'; y.letterSpacing = '0px'
  // segell
  y.save(); y.translate(tw - 250, cut + 130); y.rotate(-0.17)
  y.strokeStyle = '#e8453a'; y.lineWidth = 8; y.beginPath(); y.roundRect(-190, -85, 380, 170, 22); y.stroke()
  y.fillStyle = '#e8453a'; y.font = '800 70px "Bricolage Grotesque", sans-serif'; y.letterSpacing = '4px'; y.fillText('CANVIAT', 2, 14); y.letterSpacing = '3px'
  y.font = '800 24px "Bricolage Grotesque", sans-serif'
  y.fillText(new Date(data).toLocaleDateString('ca', { day: '2-digit', month: '2-digit', year: 'numeric' }), 2, 56); y.restore()
  if (nota) {
    y.fillStyle = 'rgba(43,8,12,.7)'; y.font = 'italic 400 32px "Fraunces", Georgia, serif'
    embolica(y, `“${nota}”`, tw - 170).slice(0, 2).forEach((l, i) => y.fillText(l, tw / 2, cut + 290 + i * 42))
  }
  // Només el cupó, amb fons transparent
  return new Promise((ok) => t.toBlob((b) => { guarda(b, `cupo-${dia}.png`); ok() }))
}
