// Efectes de so sintetitzats amb WebAudio (cap fitxer). Es poden silenciar (localStorage 'so' = '0').
let ctx, mestre

export const soActiu = () => { try { return localStorage.getItem('so') !== '0' } catch { return true } }
export const posaSo = (v) => { try { localStorage.setItem('so', v ? '1' : '0') } catch {} }

// Cal cridar-ho dins del toc de l'usuari (iOS no deixa sonar sense un gest).
function desperta() {
  if (!soActiu()) return false
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    if (!mestre) { mestre = ctx.createGain(); mestre.connect(ctx.destination) }
    mestre.gain.cancelScheduledValues(ctx.currentTime)
    mestre.gain.value = 0.5
    return true
  } catch { return false }
}

const soroll = () => {
  const b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = b.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  return b
}

// "tum" greu de batec de cor
function cop(t, v = 0.9) {
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.type = 'sine'; o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.18)
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22)
  o.connect(g); g.connect(mestre); o.start(t); o.stop(t + 0.25)
}

// Tensió: brunzit greu que puja, soroll que s'aguditza i batecs cada cop més ràpids (T segons)
export function tensio(T = 1.18) {
  if (!desperta()) return
  const t = ctx.currentTime
  const f = ctx.createBiquadFilter(); f.type = 'lowpass'
  f.frequency.setValueAtTime(120, t); f.frequency.exponentialRampToValueAtTime(900, t + T)
  const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5, t + T); g.gain.linearRampToValueAtTime(0, t + T + 0.05)
  for (const hz of [55, 58.5]) {
    const o = ctx.createOscillator(); o.type = 'sawtooth'
    o.frequency.setValueAtTime(hz, t); o.frequency.exponentialRampToValueAtTime(hz * 2.2, t + T)
    o.connect(f); o.start(t); o.stop(t + T + 0.1)
  }
  f.connect(g); g.connect(mestre)
  const s = ctx.createBufferSource(); s.buffer = soroll(); s.loop = true
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 2
  bp.frequency.setValueAtTime(300, t); bp.frequency.exponentialRampToValueAtTime(4000, t + T)
  const gs = ctx.createGain(); gs.gain.setValueAtTime(0, t); gs.gain.linearRampToValueAtTime(0.3, t + T)
  s.connect(bp); bp.connect(gs); gs.connect(mestre); s.start(t); s.stop(t + T + 0.05)
  for (const dt of [0.42, 0.8, 1.06]) if (dt < T) { cop(t + dt); cop(t + dt + 0.13, 0.5) }
}

// Moment d'obrir: impacte + crec de porta (o "pop" de tapa) + campanetes màgiques
export function obreSo(regal) {
  if (!desperta()) return
  const t = ctx.currentTime
  cop(t, 1)
  if (regal) {
    const s = ctx.createBufferSource(); s.buffer = soroll()
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1500
    const g = ctx.createGain(); g.gain.setValueAtTime(0.7, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.14)
    s.connect(hp); hp.connect(g); g.connect(mestre); s.start(t); s.stop(t + 0.2)
  } else {
    const o = ctx.createOscillator(); o.type = 'sawtooth'
    o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(95, t + 0.5)
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 22; lg.gain.value = 18
    lfo.connect(lg); lg.connect(o.frequency)
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 4
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.28, t + 0.08); g.gain.linearRampToValueAtTime(0, t + 0.55)
    o.connect(bp); bp.connect(g); g.connect(mestre); o.start(t); lfo.start(t); o.stop(t + 0.6); lfo.stop(t + 0.6)
  }
  ;[1046.5, 1318.5, 1568, 2093, 2637].forEach((hz, i) => {
    const s = t + 0.12 + i * 0.09
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = 'triangle'; o.frequency.value = hz
    g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(0.22, s + 0.01); g.gain.exponentialRampToValueAtTime(0.001, s + 0.9)
    o.connect(g); g.connect(mestre); o.start(s); o.stop(s + 1)
  })
}

// Talla el so de cop (si es salta l'escena)
export function calla() {
  if (!ctx || !mestre) return
  mestre.gain.cancelScheduledValues(ctx.currentTime)
  mestre.gain.setTargetAtTime(0, ctx.currentTime, 0.03)
}
