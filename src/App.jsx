import { useEffect, useState } from 'react'
import { per, de, intro, hora } from './config'
import { graella } from './portes'
import { desxifra, media } from './cripto'
import { avui, obertes, marcaOberta, carregaCupons, canviaCupo } from './data'
import Entrada from './Entrada'
import Fitxa from './Fitxa'
import Admin from './Admin'
import { Neu, Llums } from './Decor'

function Llaç() {
  return (
    <svg viewBox="0 0 120 80" aria-hidden className="absolute right-3 top-3 w-[26%] opacity-90" fill="none">
      <path d="M60 50C40 20 8 10 12 34c3 18 34 18 48 16Zm0 0c20-30 52-40 48-16-3 18-34 18-48 16Z" fill="#fffaeb" fillOpacity=".3" stroke="#fffaeb" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

function Obrint({ n, col, r }) {
  return (
    <div className="obrint" style={{ left: r.left, top: r.top, width: r.width, height: r.height }} aria-hidden>
      <div className="llum" />
      {n === 24 ? <><div className="cos-r c-g" /><div className="tapa-r c-g" /></> : <div className={`fulla c-${col}`}>{n}</div>}
    </div>
  )
}

const sacseja = (el) => el.animate(
  [0, -7, 7, -5, 5, 0].map((x) => ({ transform: `translateX(${x}px)` })),
  { duration: 380 },
)

export default function App() {
  const [portes, setPortes] = useState(null)
  const [dia, setDia] = useState(avui)
  const [oberta, setOberta] = useState(null)
  const [obrint, setObrint] = useState(null) // porta que s'està obrint (animació)
  const [vistes, setVistes] = useState(obertes)
  const [cupons, setCupons] = useState({})
  const [avis, setAvis] = useState('')
  const [admin, setAdmin] = useState(location.hash === '#admin')

  const prova = async (pwd) => {
    try {
      setPortes(await desxifra(pwd))
      try { localStorage.setItem('clau', pwd) } catch {}
      return true
    } catch { return false }
  }
  const refresca = async () => setCupons(await carregaCupons().catch(() => cupons))

  useEffect(() => { try { prova(localStorage.getItem('clau') || '') } catch {} }, [])
  useEffect(() => { refresca() }, [])
  // Si ella té l'app oberta quan són les 8:00, la porta s'obre sola
  useEffect(() => { const id = setInterval(() => setDia(avui()), 30000); return () => clearInterval(id) }, [])
  useEffect(() => {
    const h = () => setAdmin(location.hash === '#admin')
    addEventListener('hashchange', h)
    return () => removeEventListener('hashchange', h)
  }, [])
  useEffect(() => { if (avis) { const id = setTimeout(() => setAvis(''), 2600); return () => clearTimeout(id) } }, [avis])

  // Mentre ella mira el calendari, es descifren i decodifiquen en segon pla les fotos de les portes ja obertes
  // (i el visor 3D si és el 24), perquè en tocar la porta surtin a l'instant.
  useEffect(() => {
    if (!portes) return
    let viu = true
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 300))
    const fotos = Object.entries(portes).filter(([n, p]) => +n <= dia && /\.(jpe?g|png|webp)$/i.test(p.src || '')).map(([, p]) => p.src)
    ;(async () => {
      for (const s of fotos) {
        await new Promise((r) => idle(r))
        if (!viu) return
        try { const i = new Image(); i.src = await media(s); await i.decode() } catch {}
      }
    })()
    if (dia >= 24 && portes[24]?.tipus === 'figura') idle(() => import('./Figura'))
    return () => { viu = false }
  }, [portes, dia])

  if (!portes) return <><Neu /><Entrada prova={prova} /></>

  const obre = (n, e) => {
    if (obrint) return
    if (n > dia) {
      sacseja(e.currentTarget)
      return setAvis(`Aquesta porta s’obre el ${n} de desembre a les ${hora}:00`)
    }
    const r = e.currentTarget.getBoundingClientRect()
    const nova = !obertes().includes(n)
    marcaOberta(n)
    setVistes(obertes())
    const dades = { n, nova, x: r.left + r.width / 2, y: r.top + r.height / 2 }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return setOberta(dades)
    // La porta gira sobre la frontissa i deixa sortir una llum (el 24: el regal aixeca la tapa); la fitxa surt d'aquí
    setObrint({ n, col: graella[n][4], r: { left: r.left, top: r.top, width: r.width, height: r.height } })
    setTimeout(() => setOberta(dades), 360)
    setTimeout(() => setObrint(null), 900)
  }

  const canvia = async (n, nota) => {
    await canviaCupo(n, nota)
    await refresca()
  }

  if (admin) return <><Neu pausa /><Admin portes={portes} cupons={cupons} refresca={refresca} /></>

  const queden = 24 - dia
  return (
    <>
      <Neu pausa={!!oberta} />
      <main className="relative z-[1] mx-auto max-w-[560px] px-4 pb-16 pt-[max(2.5rem,env(safe-area-inset-top))]">
        <Llums />
        <header className="mb-8 mt-10 text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[.35em] text-or/90">Per a</p>
          <h1 className="brill-or my-1 text-[clamp(3.5rem,19vw,6.5rem)] font-extrabold leading-[.95] tracking-[-.05em]">{per}</h1>
          <p className="mx-auto max-w-[30ch] text-[15px] leading-snug text-crema/80">{intro}</p>
          <p className="mt-3 font-serif text-lg italic text-or">Amb carinyo, {de}</p>
          <p className="mt-4 text-[11px] font-extrabold uppercase tracking-[.25em] text-crema/50">
            {dia === 0 ? 'Comença l’1 de desembre' : queden > 0 ? `${queden} ${queden === 1 ? 'dia' : 'dies'} per al gran dia` : 'És el gran dia'}
          </p>
        </header>

        <div className="graella">
          {Object.entries(graella).sort((a, b) => a[0] - b[0]).map(([k, [c, f, w, h, col]]) => {
            const n = +k
            const estat = n > dia ? 'tancada' : n === dia ? 'avui' : 'oberta'
            return (
              <button
                key={n}
                className={`porta c-${col} ${obrint?.n === n ? 'invisible' : ''}`}
                data-estat={estat}
                aria-label={n > dia ? `Porta ${n}, encara tancada` : `Obre la porta ${n}`}
                onClick={(e) => obre(n, e)}
                style={{ gridColumn: `${c} / span ${w}`, gridRow: `${f} / span ${h}`, animationDelay: `${Math.min(n * 10, 220)}ms` }}
              >
                {n === 24 && <Llaç />}
                {n}
                {n === 24 && <span className="absolute bottom-3 left-3 text-[9px] font-extrabold leading-tight tracking-[.15em] text-[#5a1a10]">EL GRAN<br />DIA</span>}
                {n !== 24 && n > dia && <span className="marca">🔒</span>}
                {n !== 24 && n <= dia && vistes.includes(n) && <span className="marca">♥</span>}
              </button>
            )
          })}
        </div>
      </main>

      {obrint && <Obrint {...obrint} />}
      {avis && <div role="status" className="avis">{avis}</div>}

      {oberta && <Fitxa key={oberta.n} {...oberta} dia={oberta.n} porta={portes[oberta.n]} cupo={cupons[oberta.n]} canvia={canvia} tanca={() => setOberta(null)} />}
    </>
  )
}
