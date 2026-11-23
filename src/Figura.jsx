import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

// Roba: jersei beix de la foto del restaurant, pijama (samarreta blava + pantaló rosa) i jersei blau marí
const roba = {
  jersei: { nom: 'Jersei', top: '#9a8573', baix: '#efe6d6', sabata: '#4a2f22' },
  pijama: { nom: 'Pijama', top: '#86c8ee', baix: '#f2a7c3', sabata: '#ffffff' },
  blau: { nom: 'Blau marí', top: '#22305a', baix: '#8aa0b8', sabata: '#f4ece1' },
}
const PELL = '#e6b592'
const PELS = ['#2c1a11', '#36211a', '#40271c', '#261710']

const rng = (s) => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646

// Proporcions Funko Pop: cap enorme (més de la meitat de l'alçada), cos petit, vinil brillant.
function construeix(scene) {
  const M = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12, ...o })
  const mats = {
    top: M(roba.jersei.top, { roughness: 0.38 }), baix: M(roba.jersei.baix), sabata: M(roba.jersei.sabata),
    pell: M(PELL, { roughness: 0.3 }), pel: M('#2c1a11', { roughness: 0.34, clearcoat: 0.6 }), or: M('#e9c46a', { metalness: 1, roughness: 0.18, clearcoat: 0 }),
    fosc: M('#0a0a0c', { roughness: 0.1 }),
  }
  const fig = new THREE.Group()
  scene.add(fig)
  const add = (g, m, x, y, z, p = fig) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); p.add(o); return o }
  const ell = (rx, ry, rz, m, x, y, z, p = fig) => { const o = add(new THREE.SphereGeometry(1, 32, 20), m, x, y, z, p); o.scale.set(rx, ry, rz); return o }
  const rb = (w, h, d, r) => new RoundedBoxGeometry(w, h, d, 8, r)

  // Base amb aro daurat + ombra de contacte
  add(new THREE.CylinderGeometry(1.55, 1.62, 0.14, 64), M('#5a121b'), 0, 0, 0)
  const anell = add(new THREE.TorusGeometry(1.58, 0.045, 10, 80), mats.or, 0, 0.07, 0); anell.rotation.x = Math.PI / 2
  const cv = document.createElement('canvas'); cv.width = cv.height = 128
  const cx = cv.getContext('2d'), gr = cx.createRadialGradient(64, 64, 0, 64, 64, 64)
  gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); cx.fillStyle = gr; cx.fillRect(0, 0, 128, 128)
  const ombra = add(new THREE.CircleGeometry(1.1, 32), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }), 0, 0.075, 0.05)
  ombra.rotation.x = -Math.PI / 2

  // Peus grossos i cames curtes
  for (const s of [-1, 1]) {
    add(rb(0.5, 0.3, 0.74, 0.14), mats.sabata, s * 0.28, 0.22, 0.1)
    add(rb(0.42, 0.4, 0.42, 0.16), mats.baix, s * 0.28, 0.55, 0.02)
  }
  // Tors petit, coll del jersei, dobladillo i collaret
  add(rb(0.98, 0.78, 0.7, 0.3), mats.top, 0, 1.0, 0)
  const vora = add(new THREE.TorusGeometry(0.42, 0.075, 12, 40), M('#fff', { roughness: 0.5, clearcoat: 0.3, color: '#cbb8a4' }), 0, 0.64, 0); vora.rotation.x = Math.PI / 2; vora.scale.set(1.05, 0.85, 1)
  const coll = add(new THREE.TorusGeometry(0.34, 0.018, 8, 48), mats.or, 0, 1.38, 0.2); coll.rotation.x = Math.PI / 2.2
  ell(0.05, 0.06, 0.05, mats.or, 0, 1.08, 0.5)

  // Braços curts amb puny i mans rodones
  const braç = (s) => {
    const p = new THREE.Group(); p.position.set(s * 0.6, 1.28, 0); fig.add(p)
    add(new THREE.CapsuleGeometry(0.15, 0.32, 8, 16), mats.top, 0, -0.28, 0, p)
    const pu = add(new THREE.TorusGeometry(0.15, 0.05, 10, 24), M('#cbb8a4', { roughness: 0.5 }), 0, -0.5, 0, p); pu.rotation.x = Math.PI / 2
    add(new THREE.SphereGeometry(0.15, 24, 16), mats.pell, 0, -0.64, 0.02, p)
    return p
  }
  const bE = braç(-1), bD = braç(1)
  const pulsera = add(new THREE.TorusGeometry(0.155, 0.017, 8, 32), mats.or, 0, -0.56, 0, bE); pulsera.rotation.x = Math.PI / 2

  // CAP enorme i molt arrodonit
  const cap = new THREE.Group(); cap.position.set(0, 2.35, 0); fig.add(cap)
  add(rb(2.05, 1.8, 1.75, 0.62), mats.pell, 0, 0, 0, cap)

  // Cara pintada: ulls negres amb reflexos, pestanyes, celles gruixudes, coloret, somriure
  const ulls = new THREE.Group(); cap.add(ulls)
  const blanc = new THREE.MeshBasicMaterial({ color: '#fff' })
  for (const s of [-1, 1]) {
    ell(0.16, 0.21, 0.09, mats.fosc, s * 0.5, 0.08, 0.84, ulls)
    ell(0.05, 0.05, 0.03, blanc, s * 0.5 + 0.06, 0.17, 0.925, ulls)
    ell(0.025, 0.025, 0.02, blanc, s * 0.5 - 0.05, 0.0, 0.925, ulls)
    for (const a of [0.55, 1.05]) {
      const l = add(new THREE.CapsuleGeometry(0.016, 0.1, 4, 8), mats.fosc, s * (0.5 + 0.2), 0.15 + (a - 0.55) * 0.12, 0.88, ulls)
      l.rotation.z = -s * a
    }
    const c = ell(0.2, 0.042, 0.05, M('#1a0f0a', { roughness: 0.4 }), s * 0.5, 0.4, 0.868, cap)
    c.rotation.z = -s * 0.16
    ell(0.2, 0.12, 0.05, new THREE.MeshBasicMaterial({ color: '#f08a8a', transparent: true, opacity: 0.5 }), s * 0.74, -0.2, 0.79, cap)
  }
  add(new THREE.CircleGeometry(0.21, 32, Math.PI, Math.PI), new THREE.MeshBasicMaterial({ color: '#fffaf0' }), 0, -0.33, 0.862, cap)
  const llavi = add(new THREE.TorusGeometry(0.21, 0.032, 10, 32, Math.PI), M('#8a2f3a', { clearcoat: 0 }), 0, -0.33, 0.864, cap); llavi.rotation.z = Math.PI
  const linia = add(new THREE.CapsuleGeometry(0.026, 0.4, 4, 8), M('#8a2f3a', { clearcoat: 0 }), 0, -0.33, 0.864, cap); linia.rotation.z = Math.PI / 2

  // Cabell esculpit en una sola massa brillant: casquet, serrells amb ratlla al mig, mitxes ondulades i rínxols
  const pel = new THREE.Group(); cap.add(pel)
  ell(1.13, 0.6, 1.05, mats.pel, 0, 0.88, -0.08, pel) // cúpula arrodonida del cabell
  for (const s of [-1, 1]) {
    const sr = ell(0.62, 0.3, 0.3, mats.pel, s * 0.6, 0.62, 0.82, pel); sr.rotation.z = -s * 0.4
    for (let k = 0; k < 5; k++) ell(0.4 - k * 0.012, 0.5, 0.38, mats.pel, s * (1.1 + (k % 2 ? 0.07 : -0.03)), 0.2 - k * 0.4, -0.08 - k * 0.02, pel)
    const f = add(new THREE.TorusGeometry(0.24, 0.12, 14, 28), mats.pel, s * 1.18, -1.85, 0.08, pel); f.rotation.z = s * 0.4 // rínxol al final de la mitxa
  }
  ell(1.25, 1.5, 0.8, mats.pel, 0, -0.5, -0.8, pel)
  const r = rng(11), N = 30
  const anells = new THREE.InstancedMesh(new THREE.TorusGeometry(0.17, 0.13, 14, 20), Object.assign(mats.pel.clone(), { color: new THREE.Color('#ffffff') }), N)
  const d = new THREE.Object3D()
  for (let i = 0; i < N; i++) {
    const s = i % 2 ? 1 : -1, darrere = i % 3 === 0
    d.position.set(darrere ? (r() - 0.5) * 2.1 : s * (1.32 + r() * 0.12), darrere ? -0.3 - r() * 1.4 : 0.3 - r() * 1.9, darrere ? -1.15 - r() * 0.1 : (r() - 0.45) * 1.0)
    d.rotation.set(r() * 3, r() * 3, r() * 3); d.scale.setScalar(0.8 + r() * 0.5); d.updateMatrix()
    anells.setMatrixAt(i, d.matrix); anells.setColorAt(i, new THREE.Color(PELS[i % 4]))
  }
  pel.add(anells)

  return { fig, cap, ulls, bD, mats }
}

export default function Figura() {
  const caixa = useRef()
  const api = useRef({})
  const [sel, setSel] = useState('jersei')

  useEffect(() => {
    const el = caixa.current
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    el.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    const cam = new THREE.PerspectiveCamera(34, 1, 0.1, 60)
    cam.position.set(0, 2.9, 11)
    const llum = new THREE.DirectionalLight('#fff1d6', 2.1); llum.position.set(3, 6, 6); scene.add(llum)
    const vora = new THREE.DirectionalLight('#ff6a5a', 1.4); vora.position.set(-5, 3, -4); scene.add(vora)

    const { fig, cap, ulls, bD, mats } = construeix(scene)
    api.current.roba = (k) => { const o = roba[k]; mats.top.color.set(o.top); mats.baix.color.set(o.baix); mats.sabata.color.set(o.sabata) }

    const ctl = new OrbitControls(cam, renderer.domElement)
    ctl.target.set(0, 1.95, 0); ctl.enableZoom = false; ctl.enablePan = false; ctl.enableDamping = true
    ctl.autoRotate = true; ctl.autoRotateSpeed = 2.4; ctl.minPolarAngle = Math.PI * 0.35; ctl.maxPolarAngle = Math.PI * 0.62
    let espera
    ctl.addEventListener('start', () => { ctl.autoRotate = false; clearTimeout(espera) })
    ctl.addEventListener('end', () => { espera = setTimeout(() => (ctl.autoRotate = true), 2500) })

    const mida = () => { const { clientWidth: w, clientHeight: h } = el; renderer.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix() }
    const ro = new ResizeObserver(mida); ro.observe(el); mida()

    const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches
    const t0 = performance.now()
    renderer.setAnimationLoop(() => {
      const t = (performance.now() - t0) / 1000
      // Surt amb un rebot
      const e = Math.min(Math.max((t - 0.3) / 1.1, 0), 1), c1 = 1.9
      fig.scale.setScalar(Math.max(0.001, 1 + (c1 + 1) * Math.pow(e - 1, 3) + c1 * Math.pow(e - 1, 2)))
      if (!reduit) {
        cap.rotation.z = Math.sin(t * 1.2) * 0.04
        cap.position.y = 2.35 + Math.sin(t * 2.4) * 0.02
        ulls.scale.y = t % 3.6 > 3.5 ? 0.1 : 1 // parpelleja
        const w = t % 7 // saluda cada 7 segons
        const lv = w < 2 ? Math.sin((Math.PI * w) / 2) : 0
        bD.rotation.z = lv * (2.5 + Math.sin(t * 10) * 0.22)
      }
      ctl.update()
      renderer.render(scene, cam)
    })

    return () => {
      clearTimeout(espera); ro.disconnect(); renderer.setAnimationLoop(null); ctl.dispose()
      scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose?.() })
      pmrem.dispose(); renderer.dispose(); renderer.domElement.remove()
    }
  }, [])

  useEffect(() => api.current.roba?.(sel), [sel])

  return (
    <div>
      <div ref={caixa} className="figura" />
      <p className="mt-2 text-center text-[12px] text-crema/55">Gira-la amb el dit</p>
      <div className="mt-3 flex justify-center gap-2">
        {Object.entries(roba).map(([k, o]) => (
          <button key={k} onClick={() => setSel(k)} className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${sel === k ? 'bg-or text-vi' : 'bg-crema/10 text-crema/80'}`}>{o.nom}</button>
        ))}
      </div>
    </div>
  )
}
