import { useEffect, useState } from 'react'
import { per, de, intro, hora } from './config'
import { graella } from './portes'
import { desxifra, media } from './cripto'
import { avui, obertes, marcaOberta, carregaCupons, canviaCupo } from './data'
import Entrada from './Entrada'
import Fitxa from './Fitxa'
import Admin from './Admin'
import { Neu, Llums, Peca } from './Decor'
import Escena from './Escena'
import { tensio, soActiu, posaSo } from './so'

const sacseja = (el) => el.animate(
  [0, -7, 7, -5, 5, 0].map((x) => ({ transform: `translateX(${x}px)` })),
  { duration: 380 },
)
export default function App() {
  const [portes, setPortes] = useState(null)
  const [dia, setDia] = useState(avui)
  const [oberta, setOberta] = useState(null)
  const [vistes, setVistes] = useState(obertes)
  const [cupons, setCupons] = useState({})
  const [avis, setAvis] = useState('')
  const [admin, setAdmin] = useState(location.hash === '#admin')
  const [escena, setEscena] = useState(null) // escena d'obertura en marxa
  const [so, setSo] = useState(soActiu)

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
  // Un únic lloc controla el bloqueig del scroll (abans escena i fitxa el tocaven per separat i podia quedar bloquejat)
  useEffect(() => {
    document.body.style.overflow = escena || oberta ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [escena, oberta])
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
    if (escena) return
    if (n > dia) {
      sacseja(e.currentTarget)
      return setAvis(`Aquesta porta s’obre el ${n} de desembre a les ${hora}:00`)
    }
    const r = e.currentTarget.getBoundingClientRect()
    const nova = !obertes().includes(n)
    if (!nova || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      marcaOberta(n); setVistes(obertes())
      return setOberta({ n, nova, x: r.left + r.width / 2, y: r.top + r.height / 2 })
    }
    // Primera vegada: escena a pantalla gran amb tensió i so (el so s'ha de llançar dins del toc)
    tensio(1.18)
    setEscena({ n, r: { left: r.left, top: r.top, width: r.width, height: r.height }, regal: graella[n][5] === 'r', v: graella[n][6], col: graella[n][4] })
  }

  // Acaba l'escena: la porta/regal queda oberta per sempre i surt el contingut des del centre
  const fiEscena = (n) => {
    marcaOberta(n); setVistes(obertes())
    setOberta({ n, nova: true, x: innerWidth / 2, y: innerHeight * 0.44 })
    setTimeout(() => setEscena(null), 520)
  }

  const canvia = async (n, nota) => {
    await canviaCupo(n, nota)
    await refresca()
  }

  if (admin) return <><Neu pausa /><Admin portes={portes} cupons={cupons} refresca={refresca} /></>

  const queden = 24 - dia
  return (
    <>
      <Neu pausa={!!oberta || !!escena} />
      <main className="relative z-[1] mx-auto max-w-[560px] px-4 pb-16 pt-[max(2.5rem,env(safe-area-inset-top))]">
        <Llums />
        <button onClick={() => { posaSo(!so); setSo(!so) }} aria-label={so ? 'Silencia el so' : 'Activa el so'} className="so-btn">{so ? '🔊' : '🔇'}</button>
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
          {Object.entries(graella).sort((a, b) => a[0] - b[0]).map(([k, [c, f, w, h, col, tp, vr]]) => {
            const n = +k
            const estat = n > dia ? 'tancada' : n === dia ? 'avui' : 'oberta'
            const regal = tp === 'r'
            const jaOberta = n <= dia && vistes.includes(n)
            return (
              <button
                key={n}
                className={`porta c-${col} ${regal ? 'porta-r' : 'porta-d'} ${vr ? (regal ? 'v' : 'd') + vr : ''} ${n === 24 ? 'gran' : ''} ${jaOberta ? 'oberta' : ''} ${escena?.n === n ? 'invisible' : ''}`}
                data-estat={estat}
                aria-label={n > dia ? `${regal ? 'Regal' : 'Porta'} ${n}, encara tancat` : `Obre ${regal ? 'el regal' : 'la porta'} ${n}`}
                onClick={(e) => obre(n, e)}
                style={{ gridColumn: `${c} / span ${w}`, gridRow: `${f} / span ${h}`, animationDelay: `${Math.min(n * 10, 220)}ms` }}
              >
                <Peca n={n} regal={regal} />
                {n === 24 && <span className="absolute bottom-3 left-3 z-[2] text-[9px] font-extrabold leading-tight tracking-[.15em] text-[#5a1a10]">EL GRAN<br />DIA</span>}
                {n > dia && <span className="marca">🔒</span>}
              </button>
            )
          })}
        </div>
      </main>

      {escena && <Escena key={'escena-' + escena.n} {...escena} onFi={() => fiEscena(escena.n)} />}
      {avis && <div role="status" className="avis">{avis}</div>}

      {oberta && <Fitxa key={'fitxa-' + oberta.n} {...oberta} dia={oberta.n} porta={portes[oberta.n]} cupo={cupons[oberta.n]} canvia={canvia} tanca={() => setOberta(null)} />}
    </>
  )
}
