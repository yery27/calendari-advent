import { hora } from './config'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
// supabase-js es baixa a part i només si hi ha claus (no endarrereix la primera pantalla)
let sbP
const sb = () => url && key ? (sbP ||= import('@supabase/supabase-js').then((m) => m.createClient(url, key))) : null

const ls = (k, v) => {
  try {
    if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null')
    localStorage.setItem(k, JSON.stringify(v))
  } catch { return null }
}

// En local, ?reset a l'URL torna a deixar tancades totes les portes i regals (i els cupons canviats de proves).
if (import.meta.env.DEV && new URLSearchParams(location.search).has('reset')) {
  try { localStorage.removeItem('obertes'); localStorage.removeItem('cupons') } catch {}
}

// Dia d'avui dins del calendari: la porta N s'obre el N de desembre a partir de l'hora definida a config.js.
// En local (npm run dev) tot està obert; amb ?dia=15 simules un dia concret.
// A la web publicada s'ignora i es fa servir la data real.
export function avui(ara = new Date()) {
  if (import.meta.env.DEV) return +new URLSearchParams(location.search).get('dia') || 24
  if (ara.getMonth() === 0) return 24 // gener: tot obert
  if (ara.getMonth() < 11) return 0 // abans de desembre: tot tancat
  return Math.min(Math.max(ara.getDate() - (ara.getHours() < hora ? 1 : 0), 0), 24)
}

export const obertes = () => ls('obertes') || []
export const marcaOberta = (n) => ls('obertes', [...new Set([...obertes(), n])])

// Cupons canviats: { [dia]: { nota, canviat_at } }
export async function carregaCupons() {
  const c = sb()
  if (!c) return ls('cupons') || {}
  const { data } = await (await c).from('cupons').select('*')
  return Object.fromEntries((data || []).map((r) => [r.dia, r]))
}

export async function canviaCupo(dia, nota) {
  const fila = { dia, nota: nota || null, canviat_at: new Date().toISOString() }
  const c = sb()
  if (!c) return ls('cupons', { ...(ls('cupons') || {}), [dia]: fila })
  const { error } = await (await c).from('cupons').insert(fila)
  if (error) throw error
}
