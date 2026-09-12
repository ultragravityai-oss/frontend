import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { AudioWaveform, ChevronRight, Radar, Shield, Sparkles, Zap } from 'lucide-react'
import FeedStream from '../components/core/FeedStream'
import Hologram from '../components/core/Hologram'
import { herc, useHerc } from '../lib/hercules/store'

const QUICK = [
  { icon: Radar, label: 'DEEP SCAN', cmd: 'scan' },
  { icon: Zap, label: 'OPTIMIZE', cmd: 'optimize' },
  { icon: Shield, label: 'HARDEN', cmd: 'secure' },
  { icon: Sparkles, label: 'SITREP', cmd: 'brief' },
]

const STATE_COPY: Record<string, string> = {
  idle: 'AWAITING DIRECTIVE',
  listening: 'ACOUSTIC LINK OPEN',
  thinking: 'REASONING LATTICE ENGAGED',
  executing: 'OPERATION IN FLIGHT',
  speaking: 'CORE RESPONDING',
}

export default function CommandCenter() {
  const { core, settings, voiceLevel, tasks, stats, memory } = useHerc()
  const [value, setValue] = useState('')
  const busy = core === 'thinking' || core === 'executing'
  const running = tasks.find((t) => t.status === 'running')

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    if (!value.trim() || busy) return
    void herc.command(value)
    setValue('')
  }

  return (
    <div className="relative grid h-full grid-cols-1 gap-3 overflow-hidden p-3 xl:grid-cols-[minmax(320px,380px)_1fr_minmax(260px,320px)]">
      {/* -------- left: comm channel -------- */}
      <section className="hud-panel hud-corner order-2 flex min-h-0 flex-col p-3 xl:order-1">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[9px] tracking-[0.3em] t-dim">DIRECT CHANNEL // HERCULES</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--herc-hue)_95%_65%)] pulse-dot" />
        </div>
        <FeedStream className="min-h-24 flex-1" />
        <form onSubmit={submit} className="mt-3">
          <div
            className="flex items-center gap-2 rounded-md border bg-black/30 px-3 transition-colors"
            style={{ borderColor: busy ? 'hsl(var(--herc-hue) 90% 60% / 0.5)' : 'hsl(var(--herc-hue) 60% 50% / 0.2)' }}
          >
            <ChevronRight size={14} className="t-accent shrink-0" />
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={busy ? 'core is occupied — stand by' : 'issue a directive…'}
              disabled={busy}
              className="h-10 w-full bg-transparent text-[12px] tracking-wide text-slate-100 outline-none placeholder:text-slate-600 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={busy || !value.trim()}
              className="herc-btn shrink-0 rounded border border-[hsl(var(--herc-hue)_80%_60%/0.4)] px-2.5 py-1 text-[9px] tracking-[0.2em] t-accent disabled:opacity-30"
            >
              SEND
            </button>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {QUICK.map((q) => (
              <button
                key={q.cmd}
                type="button"
                disabled={busy}
                onClick={() => herc.forceTask(q.cmd)}
                className="herc-btn hud-panel flex flex-col items-center gap-1 rounded-md py-2 text-[8px] tracking-[0.14em] text-slate-400 hover:text-slate-100 disabled:opacity-40"
              >
                <q.icon size={13} className="t-accent" />
                {q.label}
              </button>
            ))}
          </div>
        </form>
      </section>

      {/* -------- center: holographic nexus -------- */}
      <section className="relative order-1 flex min-h-[380px] flex-col items-center justify-center xl:order-2">
        <motion.div
          layout
          className="absolute inset-0"
          animate={{ scale: core === 'executing' ? 1.04 : 1 }}
          transition={{ type: 'spring', stiffness: 60, damping: 18 }}
        >
          <Hologram state={core} hue={settings.hue} intensity={settings.intensity} voiceLevel={voiceLevel} />
        </motion.div>

        {/* orbit readout */}
        <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 text-center">
          <div className="text-[9px] tracking-[0.45em] t-dim">HOLOGRAPHIC CORE</div>
          <div className="font-display mt-1 text-[13px] font-medium tracking-[0.3em] t-accent glow">
            {STATE_COPY[core] ?? core.toUpperCase()}
          </div>
        </div>

        {/* active operation chip */}
        {running && (
          <motion.button
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => herc.navigate('execution')}
            className="herc-btn hud-panel absolute bottom-16 left-1/2 w-64 -translate-x-1/2 rounded-md px-3 py-2 text-left"
          >
            <div className="flex items-center justify-between text-[8px] tracking-[0.25em]">
              <span className="t-accent">{running.ref} · {running.intent}</span>
              <span className="t-dim tabular-nums">{Math.round(running.progress * 100)}%</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-200">{running.title}</div>
            <div className="mt-2 h-[3px] overflow-hidden rounded bg-white/5">
              <div
                className="h-full rounded transition-[width] duration-300"
                style={{ width: `${running.progress * 100}%`, background: 'var(--acc)', boxShadow: '0 0 10px var(--acc)' }}
              />
            </div>
          </motion.button>
        )}

        {/* voice link shortcut */}
        <button
          onClick={() => herc.navigate('voice')}
          className="herc-btn hud-panel absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-1.5 text-[9px] tracking-[0.25em] text-slate-300"
        >
          <AudioWaveform size={12} className="t-accent" />
          OPEN VOICE LINK
        </button>
      </section>

      {/* -------- right: vitals -------- */}
      <section className="hud-panel order-3 hidden min-h-0 flex-col p-3 xl:flex">
        <div className="mb-3 text-[9px] tracking-[0.3em] t-dim">CORE VITALS</div>
        <div className="space-y-3">
          {stats.slice(0, 5).map((s) => {
            const pct = Math.min(1, s.value / s.max)
            return (
              <div key={s.key}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-[8px] tracking-[0.22em] text-slate-500">{s.label}</span>
                  <span className="text-[10px] tabular-nums text-slate-200">
                    {s.value.toFixed(s.max <= 10 ? 1 : 0)}
                    <span className="t-dim"> {s.unit}</span>
                  </span>
                </div>
                <div className="h-[3px] overflow-hidden rounded bg-white/5">
                  <div
                    className="h-full rounded transition-all duration-700"
                    style={{
                      width: `${pct * 100}%`,
                      background: s.accent ? 'var(--acc)' : 'hsl(var(--herc-hue) 60% 45% / 0.8)',
                      boxShadow: s.accent ? '0 0 8px var(--acc)' : undefined,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="hud-divider my-3" />

        <div className="mb-2 text-[9px] tracking-[0.3em] t-dim">SESSION LEDGER</div>
        <div className="hud-scroll min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {useHercLedger()}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
          {[
            ['OPS', tasks.length],
            ['DONE', tasks.filter((t) => t.status === 'done').length],
            ['MEM', memory.length],
          ].map(([l, v], i) => (
            <div key={i} className="rounded-md border border-white/5 bg-black/20 py-1.5">
              <div className="font-display text-[14px] font-semibold tabular-nums text-slate-100">{v ?? '—'}</div>
              <div className="text-[7px] tracking-[0.25em] t-dim">{l as string}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function useHercLedger() {
  const { sessionLog } = useHerc()
  if (sessionLog.length === 0)
    return <div className="text-[9.5px] t-dim">ledger empty — activity will be inscribed here</div>
  return (
    <>
      {sessionLog.slice(0, 18).map((l, i) => (
        <div key={i} className="text-[9px] leading-relaxed text-slate-500">
          <span className="t-accent opacity-70">{l.slice(0, 10)}</span>
          {l.slice(10)}
        </div>
      ))}
    </>
  )
}
