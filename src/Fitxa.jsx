import { Fragment, Suspense, lazy, useEffect, useRef, useState } from 'react'
import { festa, focs } from './festa'

const Figura = lazy(() => import('./Figura')) // three.js només es descarrega quan fa falta

const media = (f) => `${import.meta.env.BASE_URL}media/${f}`

function Buit({ children }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-2xl border border-dashed border-crema/30 p-6 text-center text-sm text-crema/60">
      {children}
    </div>
  )
}

// Text: les paraules apareixen una a una
function Paraules({ text }) {
  let i = 0
  return (
    <div className="space-y-3 font-serif text-[17px] leading-relaxed text-crema/95">
      {text.split('\n').map((l, k) =>
        l.trim() === '' ? null : (
          <p key={k}>
            {l.split(' ').map((w) => {
              const d = Math.min(i++, 80)
              return <Fragment key={d + w}><span className="pal" style={{ '--i': d }}>{w}</span>{' '}</Fragment>
            })}
          </p>
        ),
      )}
    </div>
  )
}

// Foto: polaroid que "es revela"
function Foto({ src, text }) {
  const [err, setErr] = useState(false)
  return (
    <figure className="polaroid">
      <span className="cinta" />
      {err ? <div className="grid aspect-[4/5] place-items-center bg-vi/10 p-4 text-center text-sm text-vi/60">Aquí anirà la foto (public/media/{src})</div>
        : <img src={media(src)} alt="" onError={() => setErr(true)} className="revela aspect-[4/5] w-full object-cover" />}
      {text && <figcaption className="px-1 pb-1 pt-3 font-serif text-[15px] italic text-vi">{text}</figcaption>}
    </figure>
  )
}

// Àudio: equalitzador que balla mentre sona
function Audio({ src, text }) {
  const [on, setOn] = useState(false)
  return (
    <div className="space-y-3">
      <div className={`eq ${on ? 'on' : ''}`} aria-hidden>
        {Array.from({ length: 30 }, (_, i) => <i key={i} style={{ '--d': `${(i * 137) % 900}ms`, '--s': 0.3 + ((i * 53) % 70) / 100 }} />)}
      </div>
      <audio controls src={media(src)} className="w-full" onPlay={() => setOn(true)} onPause={() => setOn(false)} onEnded={() => setOn(false)} />
      {text && <p className="text-[15px] text-crema/80">{text}</p>}
    </div>
  )
}

// Cançó: vinil girant + reproductor
function Canco({ spotify, text }) {
  return (
    <div className="space-y-4">
      <div className="disc mx-auto" aria-hidden><div className="etiqueta" /></div>
      {spotify
        ? <iframe title="Cançó" src={`https://open.spotify.com/embed/${spotify}`} height="152" className="w-full rounded-2xl border-0" allow="encrypted-media" loading="lazy" />
        : <Buit>Aquí anirà la cançó</Buit>}
      {text && <p className="text-[15px] text-crema/80">{text}</p>}
    </div>
  )
}

// Cupó: tiquet amb segell
function Cupo({ dia, porta, cupo, canvia }) {
  const [nota, setNota] = useState('')
  const [obert, setObert] = useState(false)
  const [error, setError] = useState(false)

  const envia = async () => {
    try { await canvia(dia, nota); setError(false); festa(0.5, 0.65) } catch { setError(true) }
  }
  const data = cupo && new Date(cupo.canviat_at).toLocaleDateString('ca', { day: 'numeric', month: 'long' })

  return (
    <div className="tiquet">
      <div className="p-5 text-center">
        <p className="text-[10px] font-extrabold tracking-[.35em] text-vermell">CUPÓ</p>
        <p className="mt-2 font-serif text-[19px] italic leading-snug">{porta.text}</p>
      </div>
      <div className="tall relative p-5">
        {cupo ? (
          <div className="relative grid min-h-24 place-items-center">
            <div className="segell">CANVIAT<small>{data}</small></div>
            {cupo.nota && <p className="mt-16 text-center text-[14px] text-vi/70">“{cupo.nota}”</p>}
          </div>
        ) : obert ? (
          <div className="space-y-3">
            <textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={3} placeholder="Vols dir-me quan o com? (opcional)"
              className="w-full resize-none rounded-xl border border-vi/20 bg-white/50 p-3 text-[16px] text-vi outline-none placeholder:text-vi/40 focus:border-vermell" />
            <button onClick={envia} className="w-full rounded-full bg-vermell py-3.5 font-extrabold text-crema active:scale-[.98]">Confirmar el canvi</button>
            {error && <p className="text-center text-sm text-vermell">No s’ha pogut guardar. Torna-ho a provar.</p>}
          </div>
        ) : (
          <button onClick={() => setObert(true)} className="w-full rounded-full bg-vermell py-3.5 font-extrabold text-crema active:scale-[.98]">Canviar el cupó</button>
        )}
      </div>
    </div>
  )
}

// El 24: caixa de regal que s'obre amb raigs de llum
function Regal() {
  return (
    <div className="regal" aria-hidden>
      <div className="raigs" />
      <div className="caixa"><i className="estrella">✦</i><i className="estrella e2">✦</i><div className="tapa" /><div className="cos" /></div>
    </div>
  )
}

function Cos({ dia, porta, cupo, canvia }) {
  const { tipus, src, spotify, text } = porta
  if (tipus === 'foto') return <Foto src={src} text={text} />
  if (tipus === 'audio') return <Audio src={src} text={text} />
  if (tipus === 'video') return (<div className="space-y-3"><video controls playsInline src={media(src)} className="marc w-full rounded-2xl" />{text && <p className="text-[15px] text-crema/80">{text}</p>}</div>)
  if (tipus === 'canco') return <Canco spotify={spotify} text={text} />
  if (tipus === 'figura') return (
    <div className="space-y-4">
      {dia === 24 && <Regal />}
      <Suspense fallback={<Buit>Preparant la figura…</Buit>}><Figura /></Suspense>
      <Paraules text={text || ''} />
    </div>
  )
  if (tipus === 'cupo') return <Cupo dia={dia} porta={porta} cupo={cupo} canvia={canvia} />
  return (<>{dia === 24 && <Regal />}<Paraules text={text || ''} /></>)
}

export default function Fitxa({ dia, x, y, nova, porta, cupo, canvia, tanca }) {
  const vel = useRef()

  useEffect(() => {
    const k = (e) => e.key === 'Escape' && tanca()
    addEventListener('keydown', k)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // El panell s'expandeix en cercle des de la porta que s'ha tocat
    const r = Math.hypot(innerWidth, innerHeight)
    vel.current.animate(
      [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${r}px at ${x}px ${y}px)` }],
      { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)' },
    )
    let atura
    if (dia === 24) atura = focs()
    else if (nova) festa(x / innerWidth, y / innerHeight)
    return () => { removeEventListener('keydown', k); document.body.style.overflow = prev; atura?.() }
  }, [])

  return (
    <div ref={vel} className="fixed inset-0 z-10 flex items-end justify-center bg-[#12040680] md:items-center" onClick={tanca}>
      <article
        onClick={(e) => e.stopPropagation()}
        className="fitxa relative max-h-[92dvh] w-full max-w-[520px] overflow-y-auto rounded-t-[28px] bg-crema p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-vi md:rounded-[28px]"
      >
        <button onClick={tanca} aria-label="Tancar" className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-vi/10 text-lg">✕</button>
        <p className="brill-or [--base:#e8453a] text-[64px] font-extrabold leading-none tracking-[-.05em]">{dia}</p>
        <h2 className="mb-4 mt-1 font-serif text-2xl italic leading-tight">{porta.titol}</h2>
        <div className="rounded-2xl bg-vi p-4 text-crema">
          <Cos dia={dia} porta={porta} cupo={cupo} canvia={canvia} />
        </div>
      </article>
    </div>
  )
}
