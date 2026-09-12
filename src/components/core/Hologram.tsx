import { useEffect, useRef } from 'react'
import type { CoreState } from '../../lib/hercules/types'

/* ============================================================
   HOLOGRAPHIC CORE — cinematic canvas renderer.
   Particle-sphere entity on a pylonic light beam, with floor
   reflection, chromatic rims, pulse rings and lens flare.
   Reacts to core state + voice amplitude.
   ============================================================ */

interface Props {
  state: CoreState
  hue: number
  intensity: number // 0..100
  voiceLevel?: number
  className?: string
}

const STATE_PROFILE: Record<CoreState, { speed: number; energy: number; breathe: number }> = {
  offline: { speed: 0.06, energy: 0.1, breathe: 0.12 },
  booting: { speed: 1.6, energy: 1.35, breathe: 0.9 },
  idle: { speed: 0.3, energy: 0.42, breathe: 0.45 },
  listening: { speed: 0.85, energy: 1.0, breathe: 1.05 },
  thinking: { speed: 2.3, energy: 1.55, breathe: 0.7 },
  executing: { speed: 3.2, energy: 1.85, breathe: 0.85 },
  speaking: { speed: 0.75, energy: 1.1, breathe: 1.35 },
}

interface Particle {
  theta: number
  phi: number
  r: number
  size: number
  tw: number
}

export default function Hologram({ state, hue, intensity, voiceLevel = 0, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sRef = useRef({ state, hue, intensity, voiceLevel })
  sRef.current = { state, hue, intensity, voiceLevel }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0
    let dpr = 1

    const P_COUNT = 680
    const particles: Particle[] = []
    const GA = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < P_COUNT; i++) {
      const y = 1 - (i / (P_COUNT - 1)) * 2
      const rad = Math.sqrt(1 - y * y)
      const theta = GA * i
      particles.push({
        theta,
        phi: Math.acos(y),
        r: rad,
        size: 0.5 + Math.random() * 1.4,
        tw: Math.random() * Math.PI * 2,
      })
    }

    interface Arc { a: number; b: number; life: number; max: number }
    interface Pulse { r: number; alpha: number; speed: number }
    let arcs: Arc[] = []
    let pulses: Pulse[] = []

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(2, window.devicePixelRatio || 1)
      w = rect.width
      h = rect.height
      canvas.width = Math.max(1, w * dpr)
      canvas.height = Math.max(1, h * dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let t = 0
    let smoothEnergy = 0.3
    let lastPulse = 0

    const draw = () => {
      const { state: st, hue: H, intensity: INT, voiceLevel: VL } = sRef.current
      const prof = STATE_PROFILE[st]
      t += 0.016
      smoothEnergy += (prof.energy - smoothEnergy) * 0.05
      const energy = smoothEnergy * (0.7 + (INT / 100) * 0.6) + VL * 0.8

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const cx = w / 2
      const cy = h / 2 - h * 0.04
      const R = Math.min(w, h) * 0.27 * (1 + Math.sin(t * 1.4) * 0.02 * prof.breathe + VL * 0.1)
      const floorY = cy + R * 2.05

      /* ---------------- dark cinematic plate ---------------- */
      ctx.globalCompositeOperation = 'source-over'
      const plate = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7)
      plate.addColorStop(0, 'hsla(220, 60%, 7%, 0.55)')
      plate.addColorStop(1, 'hsla(0,0%,0%,0)')
      ctx.fillStyle = plate
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'

      /* ---------------- light pillar ---------------- */
      const beamW = R * (0.5 + energy * 0.12)
      const flick = 0.8 + Math.sin(t * 13.7) * 0.06 + Math.sin(t * 3.1) * 0.08
      const beam = ctx.createLinearGradient(cx - beamW, 0, cx + beamW, 0)
      beam.addColorStop(0, 'hsla(0,0%,0%,0)')
      beam.addColorStop(0.42, `hsla(${H}, 95%, 62%, ${0.05 * flick + energy * 0.035})`)
      beam.addColorStop(0.5, `hsla(${H}, 100%, 78%, ${0.10 * flick + energy * 0.06})`)
      beam.addColorStop(0.58, `hsla(${H}, 95%, 62%, ${0.05 * flick + energy * 0.035})`)
      beam.addColorStop(1, 'hsla(0,0%,0%,0)')
      ctx.fillStyle = beam
      ctx.fillRect(cx - beamW, 0, beamW * 2, h)

      /* ---------------- ambient halo ---------------- */
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 2.7)
      halo.addColorStop(0, `hsla(${H}, 95%, 60%, ${0.15 + energy * 0.11})`)
      halo.addColorStop(0.5, `hsla(${H}, 90%, 50%, ${0.05 + energy * 0.045})`)
      halo.addColorStop(1, 'hsla(0, 0%, 0%, 0)')
      ctx.fillStyle = halo
      ctx.fillRect(0, 0, w, h)

      /* ---------------- nucleus ---------------- */
      const beat = 1 + Math.sin(t * (1.5 + prof.speed)) * 0.09 * prof.breathe + VL * 0.35
      const nuc = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.58 * beat)
      nuc.addColorStop(0, `hsla(${H}, 100%, 93%, ${0.85 * Math.min(1, 0.35 + energy * 0.5)})`)
      nuc.addColorStop(0.25, `hsla(${H}, 100%, 68%, ${0.5 * energy + 0.16})`)
      nuc.addColorStop(1, 'hsla(0,0%,0%,0)')
      ctx.fillStyle = nuc
      ctx.beginPath()
      ctx.arc(cx, cy, R * 0.58 * beat, 0, Math.PI * 2)
      ctx.fill()

      /* hot white-heart flare when energy is high */
      if (energy > 0.85) {
        const heart = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.22)
        heart.addColorStop(0, `hsla(0, 0%, 100%, ${(energy - 0.85) * 0.9})`)
        heart.addColorStop(1, 'hsla(0,0%,0%,0)')
        ctx.fillStyle = heart
        ctx.beginPath()
        ctx.arc(cx, cy, R * 0.22, 0, Math.PI * 2)
        ctx.fill()
      }

      /* ---------------- sphere particles ---------------- */
      const rotY = t * 0.35 * prof.speed
      const rotX = 0.42 + Math.sin(t * 0.11) * 0.08
      const cosY = Math.cos(rotY)
      const sinY = Math.sin(rotY)
      const cosX = Math.cos(rotX)
      const sinX = Math.sin(rotX)
      const sphereR = R * 1.28

      for (let i = 0; i < P_COUNT; i++) {
        const p = particles[i]
        const wob = Math.sin(t * (1.1 + p.tw * 0.2) + p.tw) * 0.035 * energy
        const rr = sphereR * (1 + wob)
        const x = p.r * Math.cos(p.theta) * rr
        const y = Math.cos(p.phi) * rr
        const z = p.r * Math.sin(p.theta) * rr
        const x1 = x * cosY + z * sinY
        const z1 = -x * sinY + z * cosY
        const y1 = y * cosX - z1 * sinX
        const z2 = y * sinX + z1 * cosX
        const depth = (z2 / sphereR + 1) / 2
        const px = cx + x1
        const py = cy + y1
        const twinkle = 0.55 + 0.45 * Math.sin(t * 3 + p.tw * 7)
        const alpha = (0.12 + depth * 0.75) * twinkle * Math.min(1, 0.4 + energy)
        const sz = p.size * (0.5 + depth) * (1 + VL * 0.6)
        ctx.fillStyle = `hsla(${H + depth * 22 - 8}, 95%, ${58 + depth * 22}%, ${alpha})`
        ctx.beginPath()
        ctx.arc(px, py, sz, 0, Math.PI * 2)
        ctx.fill()
      }

      /* ---------------- chromatic rim ghosts ---------------- */
      ctx.lineWidth = 1
      const rimA = 0.10 + energy * 0.10
      ctx.strokeStyle = `hsla(${(H + 42) % 360}, 100%, 65%, ${rimA})`
      ctx.beginPath()
      ctx.arc(cx - 1.6, cy - 1.2, sphereR * 1.02, 0, Math.PI * 2)
      ctx.stroke()
      ctx.strokeStyle = `hsla(${(H + 318) % 360}, 100%, 62%, ${rimA * 0.8})`
      ctx.beginPath()
      ctx.arc(cx + 1.7, cy + 1.1, sphereR * 1.025, 0, Math.PI * 2)
      ctx.stroke()

      /* ---------------- expanding pulse rings ---------------- */
      if (t - lastPulse > 2.6 / (0.4 + prof.breathe) + Math.random() * 0.4) {
        pulses.push({ r: sphereR * 0.9, alpha: 0.5, speed: 1.1 + energy * 0.5 })
        lastPulse = t
      }
      pulses = pulses.filter((pu) => pu.alpha > 0.01)
      pulses.forEach((pu) => {
        pu.r += pu.speed
        pu.alpha *= 0.965
        ctx.save()
        ctx.translate(cx, cy)
        ctx.scale(1, 0.32)
        ctx.beginPath()
        ctx.arc(0, 0, pu.r, 0, Math.PI * 2)
        ctx.strokeStyle = `hsla(${H}, 95%, 68%, ${pu.alpha * 0.5})`
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.restore()
      })

      /* ---------------- orbital rings ---------------- */
      const rings: Array<{ incl: number; speed: number; rad: number; alpha: number; w: number }> = [
        { incl: 0.32, speed: 0.6, rad: 1.62, alpha: 0.55, w: 1.2 },
        { incl: -0.52, speed: -0.4, rad: 1.88, alpha: 0.3, w: 0.8 },
        { incl: 1.15, speed: 0.9, rad: 1.45, alpha: 0.22, w: 0.6 },
      ]
      rings.forEach((ring, ri) => {
        const rot = t * ring.speed * (0.4 + prof.speed * 0.5)
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(ring.incl)
        ctx.scale(1, 0.28 + 0.1 * Math.sin(t * 0.3 + ri))
        ctx.rotate(rot)
        const rr2 = R * ring.rad
        // dashed gyro segment
        ctx.beginPath()
        ctx.ellipse(0, 0, rr2, rr2, 0, 0, Math.PI * 2)
        ctx.strokeStyle = `hsla(${H}, 90%, 62%, ${ring.alpha * (0.35 + energy * 0.5)})`
        ctx.lineWidth = ring.w
        ctx.setLineDash(ri === 2 ? [3, 9] : [])
        ctx.stroke()
        ctx.setLineDash([])
        const sats = ri === 0 ? 2 : 1
        for (let s = 0; s < sats; s++) {
          const a = rot * 2 + (s * Math.PI * 2) / sats + ri
          const sx = Math.cos(a) * rr2
          const sy = Math.sin(a) * rr2
          const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 7)
          g.addColorStop(0, `hsla(${H}, 100%, 85%, ${0.9 * Math.min(1, energy + 0.3)})`)
          g.addColorStop(1, 'hsla(0,0%,0%,0)')
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(sx, sy, 7, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      })

      /* ---------------- energy arcs ---------------- */
      if (Math.random() < energy * 0.06) {
        arcs.push({ a: Math.random() * Math.PI * 2, b: Math.random() * Math.PI * 2, life: 0, max: 6 + Math.random() * 10 })
      }
      arcs = arcs.filter((arc) => arc.life < arc.max)
      arcs.forEach((arc) => {
        arc.life++
        const fade = 1 - arc.life / arc.max
        const r1 = sphereR * 1.05
        const p1 = { x: cx + Math.cos(arc.a) * r1, y: cy + Math.sin(arc.a) * r1 * 0.9 }
        const p2 = { x: cx + Math.cos(arc.b) * r1, y: cy + Math.sin(arc.b) * r1 * 0.9 }
        const mx = (p1.x + p2.x) / 2 + (Math.random() - 0.5) * 60
        const my = (p1.y + p2.y) / 2 + (Math.random() - 0.5) * 60
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.quadraticCurveTo(mx, my, p2.x, p2.y)
        ctx.strokeStyle = `hsla(${H}, 100%, 78%, ${0.4 * fade})`
        ctx.lineWidth = 1
        ctx.stroke()
      })

      /* ---------------- floor reflection ---------------- */
      ctx.save()
      ctx.translate(cx, floorY)
      ctx.scale(1, 0.24)
      const refl = ctx.createRadialGradient(0, 0, 0, 0, 0, sphereR * 1.5)
      refl.addColorStop(0, `hsla(${H}, 95%, 60%, ${0.10 + energy * 0.06})`)
      refl.addColorStop(0.6, `hsla(${H}, 90%, 50%, ${0.04})`)
      refl.addColorStop(1, 'hsla(0,0%,0%,0)')
      ctx.fillStyle = refl
      ctx.beginPath()
      ctx.arc(0, 0, sphereR * 1.5, 0, Math.PI * 2)
      ctx.fill()
      // floor etch rings
      for (let fr = 1; fr <= 3; fr++) {
        ctx.beginPath()
        ctx.arc(0, 0, sphereR * (0.75 + fr * 0.4), 0, Math.PI * 2)
        ctx.strokeStyle = `hsla(${H}, 80%, 60%, ${0.10 - fr * 0.028})`
        ctx.lineWidth = 1.4
        ctx.stroke()
      }
      ctx.restore()

      /* ---------------- lens flare cross ---------------- */
      if (energy > 0.7) {
        const flareLen = R * (2.1 + energy)
        const fa = (energy - 0.7) * 0.5
        const mk = (angle: number, thick: number, alpha: number) => {
          ctx.save()
          ctx.translate(cx, cy)
          ctx.rotate(angle)
          const g = ctx.createLinearGradient(-flareLen, 0, flareLen, 0)
          g.addColorStop(0, 'hsla(0,0%,0%,0)')
          g.addColorStop(0.5, `hsla(${H}, 100%, 80%, ${alpha})`)
          g.addColorStop(1, 'hsla(0,0%,0%,0)')
          ctx.fillStyle = g
          ctx.fillRect(-flareLen, -thick / 2, flareLen * 2, thick)
          ctx.restore()
        }
        mk(0.2, 1.1, fa)
        mk(Math.PI / 2 + 0.2, 0.7, fa * 0.6)
      }

      /* ---------------- equatorial scanline ---------------- */
      const scanY = cy + Math.sin(t * 0.8) * R * 0.8
      const scan = ctx.createLinearGradient(cx - sphereR, 0, cx + sphereR, 0)
      scan.addColorStop(0, 'hsla(0,0%,0%,0)')
      scan.addColorStop(0.5, `hsla(${H}, 100%, 72%, ${0.10 + energy * 0.10})`)
      scan.addColorStop(1, 'hsla(0,0%,0%,0)')
      ctx.fillStyle = scan
      ctx.fillRect(cx - sphereR, scanY, sphereR * 2, 1)

      ctx.globalCompositeOperation = 'source-over'
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className={className} style={{ width: '100%', height: '100%' }} />
}
