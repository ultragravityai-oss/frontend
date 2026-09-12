import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Cpu, Flame, GitBranch, Waves } from 'lucide-react'
import { MODULES } from '../lib/hercules/engine'
import { useHerc } from '../lib/hercules/store'
import type { SysStat } from '../lib/hercules/types'

/* ---------- sparkline ---------- */
function Spark({ data, max, accent }: { data: number[]; max: number; accent?: boolean }) {
  const w = 120
  const h = 26
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - (Math.min(1, v / max) * (h - 3) + 1)}`)
    .join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-6 w-full" preserveAspectRatio="none">
      <polyline
        points={pts}
        fill="none"
        stroke={accent ? 'var(--acc)' : 'hsl(var(--herc-hue) 55% 45% / 0.7)'}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ---------- arc gauge ---------- */
function Gauge({ s }: { s: SysStat }) {
  const pct = Math.min(1, s.value / s.max)
  const R = 30
  const C = Math.PI * R // half circle
  return (
    <div className="hud-panel flex flex-col items-center p-3">
      <svg viewBox="0 0 80 48" className="w-full max-w-32">
        <path d="M 8 44 A 30 30 0 0 1 72 44" fill="none" stroke="hsl(0 0% 100% / 0.07)" strokeWidth="4" strokeLinecap="round" />
        <path
          d="M 8 44 A 30 30 0 0 1 72 44"
          fill="none"
          stroke={s.accent ? 'var(--acc)' : 'hsl(var(--herc-hue) 65% 50% / 0.85)'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${pct * C} ${C}`}
          style={{ filter: s.accent ? 'drop-shadow(0 0 5px hsl(var(--herc-hue) 95% 60% / 0.7))' : undefined, transition: 'stroke-dasharray 0.8s ease' }}
        />
        <text x="40" y="40" textAnchor="middle" className="fill-slate-100" fontSize="13" fontWeight="600" fontFamily="Space Grotesk">
          {s.value.toFixed(s.max <= 10 ? 1 : 0)}
        </text>
        <text x="40" y="47" textAnchor="middle" className="fill-slate-500" fontSize="6" fontFamily="JetBrains Mono">
          {s.unit}
        </text>
      </svg>
      <div className="mt-1 w-full">
        <div className="mb-1 text-center text-[8px] tracking-[0.2em] text-slate-400">{s.label}</div>
        <Spark data={s.history} max={s.max} accent={s.accent} />
      </div>
    </div>
  )
}

/* ---------- live area chart ---------- */
function ThroughputChart({ data, max, hue }: { data: number[]; max: number; hue: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const w = rect.width
    const h = rect.height
    ctx.clearRect(0, 0, w, h)

    // grid
    ctx.strokeStyle = 'hsla(0,0%,100%,0.05)'
    ctx.lineWidth = 1
    for (let i = 1; i < 4; i++) {
      const y = (h / 4) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }

    const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - Math.min(1, v / max) * (h - 8) - 4] as const)
    // area
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, `hsla(${hue}, 95%, 60%, 0.35)`)
    grad.addColorStop(1, `hsla(${hue}, 95%, 60%, 0)`)
    ctx.beginPath()
    ctx.moveTo(0, h)
    pts.forEach(([x, y]) => ctx.lineTo(x, y))
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()
    // line
    ctx.beginPath()
    pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
    ctx.strokeStyle = `hsla(${hue}, 100%, 70%, 0.95)`
    ctx.lineWidth = 1.6
    ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.8)`
    ctx.shadowBlur = 8
    ctx.stroke()
    ctx.shadowBlur = 0
    // head dot
    const [hx, hy] = pts[pts.length - 1]
    ctx.beginPath()
    ctx.arc(hx, hy, 3, 0, Math.PI * 2)
    ctx.fillStyle = '#eaffff'
    ctx.fill()
  }, [data, max, hue])
  return <canvas ref={ref} className="h-full w-full" />
}

/* ---------- screen ---------- */
export default function NeuralGrid() {
  const { stats, settings, core } = useHerc()
  const neural = stats.find((s) => s.key === 'neural')!
  const io = stats.find((s) => s.key === 'io')!
  const modulePower = MODULES.filter((m) => settings.modules[m.id]).reduce((a, m) => a + m.power, 0)

  return (
    <div className="hud-scroll h-full overflow-y-auto p-3">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[9px] tracking-[0.3em] t-dim">SUBSTRATE TELEMETRY</div>
          <h2 className="font-display mt-1 text-xl font-semibold tracking-[0.12em] text-slate-100">
            NEURAL <span className="t-accent">GRID</span>
          </h2>
        </div>
        <div className="flex items-center gap-4 text-[9px] tracking-[0.2em] t-dim">
          <span className="flex items-center gap-1.5">
            <Cpu size={12} className="t-accent" /> LATTICE {settings.modules.quantum ? 'HOT' : 'COLD'}
          </span>
          <span className="flex items-center gap-1.5">
            <Flame size={12} className="t-accent" /> MODULE DRAW {modulePower}%
          </span>
          <span className="flex items-center gap-1.5">
            <Waves size={12} className="t-accent" /> {core.toUpperCase()}
          </span>
        </div>
      </div>

      {/* gauges */}
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((s, i) => (
          <motion.div key={s.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Gauge s={s} />
          </motion.div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[1fr_320px]">
        {/* throughput */}
        <div className="hud-panel hud-corner p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[9px] tracking-[0.3em] t-dim">NEURAL LOAD — LIVE TRACE</span>
            <span className="text-[10px] tabular-nums t-accent glow">{neural.value.toFixed(0)}%</span>
          </div>
          <div className="h-40 md:h-48">
            <ThroughputChart data={neural.history} max={100} hue={settings.hue} />
          </div>
          <div className="hud-divider my-3" />
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[9px] tracking-[0.3em] t-dim">I/O THROUGHPUT — LIVE TRACE</span>
            <span className="text-[10px] tabular-nums t-accent2">{io.value.toFixed(1)} GB/s</span>
          </div>
          <div className="h-24">
            <ThroughputChart data={io.history} max={10} hue={36} />
          </div>
        </div>

        {/* process lattice */}
        <div className="hud-panel p-4">
          <div className="mb-3 text-[9px] tracking-[0.3em] t-dim">PROCESS LATTICE</div>
          <div className="space-y-2">
            {MODULES.map((m) => {
              const on = settings.modules[m.id]
              return (
                <div key={m.id} className="flex items-center gap-2.5">
                  <GitBranch size={11} className={on ? 't-accent' : 'text-slate-600'} />
                  <div className="min-w-0 flex-1">
                    <div className={`truncate text-[10px] ${on ? 'text-slate-200' : 'text-slate-600'}`}>{m.name}</div>
                    <div className="mt-1 h-[2px] overflow-hidden rounded bg-white/5">
                      <motion.div
                        className="h-full rounded"
                        animate={{ width: on ? `${m.power * 4}%` : '2%' }}
                        style={{ background: on ? 'var(--acc)' : 'hsl(0 0% 100% / 0.15)' }}
                      />
                    </div>
                  </div>
                  <span className={`text-[8px] tracking-[0.15em] ${on ? 't-accent' : 't-dim'}`}>
                    {on ? 'ACTIVE' : 'COLD'}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="mt-4 border-t border-white/5 pt-3 text-[9px] leading-relaxed text-slate-500">
            Module states are governed in the Core Chamber. Cold modules shed their draw within one
            telemetry cycle.
          </p>
        </div>
      </div>
    </div>
  )
}
