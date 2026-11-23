import { useEffect, useRef, useState } from 'react'

// API gratuïta d'iTunes (sense clau): dona el títol, l'artista, la portada i 30 s de la cançó.
// A contingut.json: { "tipus": "canco", "cerca": "Last Christmas Wham" }  o bé  { "itunes": 202117984 } (més exacte).
const api = 'https://itunes.apple.com'
const cau = new Map()
function troba({ itunes, cerca }) {
  const k = itunes || cerca
  if (!cau.has(k)) {
    const u = itunes ? `${api}/lookup?id=${itunes}&country=ES` : `${api}/search?term=${encodeURIComponent(cerca)}&media=music&entity=song&limit=1&country=ES`
    cau.set(k, fetch(u).then((r) => r.json()).then((j) => {
      const r = j.results?.[0]
      if (!r?.previewUrl) throw new Error('sense cançó')
      return {
        titol: r.trackName, artista: r.artistName, preview: r.previewUrl,
        cover: r.artworkUrl100.replace('100x100', '600x600'),
        enllac: `https://open.spotify.com/search/${encodeURIComponent(`${r.trackName} ${r.artistName}`)}`,
      }
    }))
  }
  return cau.get(k)
}

const Icona = ({ on }) => (
  <svg viewBox="0 0 24 24" className="size-8" fill="currentColor">{on ? <path d="M7 5h4v14H7zM13 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}</svg>
)

export default function Canco({ porta }) {
  const [t, setT] = useState(null)
  const [err, setErr] = useState(false)
  const [on, setOn] = useState(false)
  const [p, setP] = useState(0)
  const au = useRef()
  const hiHa = porta.cerca || porta.itunes

  useEffect(() => { if (hiHa) troba(porta).then(setT).catch(() => setErr(true)) }, [])

  return (
    <div className="space-y-4 text-center">
      <div className={`disc mx-auto ${on ? '' : 'pausat'}`} aria-hidden>
        <div className="etiqueta" style={t ? { backgroundImage: `url(${t.cover})`, backgroundSize: 'cover' } : undefined} />
      </div>

      {t && (
        <>
          <div>
            <p className="text-xl font-extrabold leading-tight">{t.titol}</p>
            <p className="text-crema/60">{t.artista}</p>
          </div>
          <audio ref={au} src={t.preview} preload="auto"
            onPlay={() => setOn(true)} onPause={() => setOn(false)} onEnded={() => { setOn(false); setP(0) }}
            onTimeUpdate={(e) => setP(e.target.currentTime / (e.target.duration || 30))} />
          <button onClick={() => (au.current.paused ? au.current.play() : au.current.pause())} aria-label={on ? 'Pausa' : 'Reprodueix'}
            className="relative mx-auto grid size-20 place-items-center rounded-full bg-vermell text-crema active:scale-95">
            <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90" aria-hidden>
              <circle cx="40" cy="40" r="37" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="3" />
              <circle cx="40" cy="40" r="37" fill="none" stroke="#e9c46a" strokeWidth="3" strokeLinecap="round" strokeDasharray="232.5" strokeDashoffset={232.5 * (1 - p)} />
            </svg>
            <Icona on={on} />
          </button>
          <a href={t.enllac} target="_blank" rel="noopener" className="inline-block text-sm text-or underline underline-offset-4">Escolta-la sencera</a>
        </>
      )}
      {hiHa && !t && !err && <p className="text-sm text-crema/50">Carregant…</p>}
      {err && <p className="text-sm text-crema/60">No s’ha pogut carregar la cançó. Torna-ho a provar en una estona.</p>}
      {!hiHa && !porta.spotify && (
        <div className="grid min-h-24 place-items-center rounded-2xl border border-dashed border-crema/30 p-6 text-sm text-crema/60">Aquí anirà la cançó</div>
      )}
      {porta.spotify && <iframe title="Cançó" src={`https://open.spotify.com/embed/${porta.spotify}`} height="152" className="w-full rounded-2xl border-0" allow="encrypted-media" loading="lazy" />}
      {porta.text && <p className="text-[15px] text-crema/80">{porta.text}</p>}
      {t && <p className="text-[11px] text-crema/40">Previsualització de 30 segons</p>}
    </div>
  )
}
