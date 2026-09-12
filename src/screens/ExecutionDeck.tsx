import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronRight, CircleDashed, Loader, Play, Radar, Shield, Zap } from 'lucide-react'
import { herc, useHerc } from '../lib/hercules/store'
import type { HTask } from '../lib/hercules/types'

const PRESETS = [
  { label: 'DIAGNOSTIC SWEEP', cmd: 'scan', icon: Radar, desc: 'interrogate every sector' },
  { label: 'THROUGHPUT PASS', cmd: 'optimize', icon: Zap, desc: 'reclaim & rebalance' },
  { label: 'PERIMETER HARDEN', cmd: 'secure', icon: Shield, desc: 'rotate keys · arm sentinels' },
]

function StepRow({ task, idx }: { task: HTask; idx: number }) {
  const s = task.steps[idx]
  const active = s.status === 'active'
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.04 }}
      className={`flex items-center gap-3 rounded-md border px-3 py-2 transition-colors ${
        active
          ? 'border-[hsl(var(--herc-hue)_90%_60%/0.45)] bg-[hsl(var(--herc-hue)_90%_50%/0.08)]'
          : 'border-white/5 bg-black/20'
      }`}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
        {s.status === 'done' ? (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500 }}>
            <Check size={13} className="t-accent" />
          </motion.span>
        ) : active ? (
          <Loader size={13} className="t-accent animate-spin" style={{ animationDuration: '1.2s' }} />
        ) : (
          <CircleDashed size={13} className="text-slate-600" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className={`truncate text-[11px] ${active ? 'text-slate-100' : s.status === 'done' ? 'text-slate-400' : 'text-slate-500'}`}>
          {s.label}
        </div>
        <div className="text-[8.5px] tracking-[0.12em] t-dim">{s.detail}</div>
      </div>
      {active && <span className="caret t-accent text-[10px]">▍</span>}
    </motion.div>
  )
}

function TaskCard({ task, defaultOpen }: { task: HTask; defaultOpen: boolean }) {
  const done = task.status === 'done'
  return (
    <motion.details
      layout
      open={defaultOpen || !done}
      className="hud-panel group overflow-hidden"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${done ? '' : 'pulse-dot'}`}
          style={{
            background: done ? 'hsl(150 70% 55% / 0.9)' : 'var(--acc)',
            boxShadow: done ? '0 0 8px hsl(150 70% 55% / 0.6)' : '0 0 10px var(--acc)',
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[8px] tracking-[0.25em] t-accent">{task.ref}</span>
            <span className="text-[8px] tracking-[0.2em] t-dim">{task.intent}</span>
          </div>
          <div className="truncate text-[12px] text-slate-100">{task.title}</div>
        </div>
        {done && task.result && <span className="hidden text-[9px] tracking-wide text-emerald-300/80 md:block">{task.result}</span>}
        <span className="text-[10px] tabular-nums t-dim">{Math.round(task.progress * 100)}%</span>
        <ChevronRight size={13} className="t-dim transition-transform group-open:rotate-90" />
      </summary>
      <div className="border-t border-white/5 p-3 pt-3">
        <div className="grid gap-1.5 sm:grid-cols-2">
          {task.steps.map((_, i) => (
            <StepRow key={task.steps[i].id} task={task} idx={i} />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-[3px] flex-1 overflow-hidden rounded bg-white/5">
            <div
              className="h-full rounded transition-[width] duration-300"
              style={{
                width: `${task.progress * 100}%`,
                background: done ? 'hsl(150 70% 50%)' : 'var(--acc)',
                boxShadow: `0 0 10px ${done ? 'hsl(150 70% 50% / 0.7)' : 'var(--acc)'}`,
              }}
            />
          </div>
          <span className="text-[8px] tracking-[0.2em] t-dim">
            {done ? 'COMPLETE' : 'IN FLIGHT'}
          </span>
        </div>
      </div>
    </motion.details>
  )
}

export default function ExecutionDeck() {
  const { tasks, core } = useHerc()
  const busy = core === 'thinking' || core === 'executing'

  return (
    <div className="hud-scroll grid h-full grid-cols-1 gap-3 overflow-y-auto p-3 lg:grid-cols-[300px_1fr]">
      {/* launcher column */}
      <aside className="space-y-3">
        <div className="hud-panel hud-corner p-4">
          <div className="text-[9px] tracking-[0.3em] t-dim">ORCHESTRATION DECK</div>
          <h2 className="font-display mt-2 text-xl font-semibold tracking-[0.12em] text-slate-100">
            TASK <span className="t-accent">EXECUTION</span>
          </h2>
          <p className="mt-2 text-[10.5px] leading-relaxed text-slate-400">
            Every directive spawns a staged operation here. Watch each stage ignite, resolve and seal
            in real time.
          </p>
        </div>

        {PRESETS.map((p) => (
          <button
            key={p.cmd}
            disabled={busy}
            onClick={() => herc.forceTask(p.cmd)}
            className="herc-btn hud-panel group flex w-full items-center gap-3 p-3.5 text-left disabled:opacity-40"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[hsl(var(--herc-hue)_80%_60%/0.3)] bg-[hsl(var(--herc-hue)_80%_50%/0.08)]">
              <p.icon size={16} className="t-accent" />
            </span>
            <span className="flex-1">
              <span className="block text-[10px] font-semibold tracking-[0.18em] text-slate-100">{p.label}</span>
              <span className="block text-[9px] text-slate-500">{p.desc}</span>
            </span>
            <Play size={12} className="t-dim transition-all group-hover:translate-x-0.5 group-hover:text-slate-200" />
          </button>
        ))}

        <div className="hud-panel p-3.5">
          <div className="mb-2 text-[9px] tracking-[0.25em] t-dim">+ CUSTOM OPERATION</div>
          <CustomOp />
        </div>
      </aside>

      {/* operations list */}
      <section className="min-h-0">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-[9px] tracking-[0.3em] t-dim">
            OPERATIONS — {tasks.filter((t) => t.status === 'running').length} ACTIVE / {tasks.length} TOTAL
          </span>
        </div>
        <div className="space-y-2.5">
          <AnimatePresence>
            {tasks.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hud-panel flex h-56 flex-col items-center justify-center gap-3 text-center"
              >
                <CircleDashed size={26} className="t-dim" />
                <div className="text-[10px] tracking-[0.3em] t-dim">NO OPERATIONS YET</div>
                <p className="max-w-64 text-[10px] leading-relaxed text-slate-500">
                  Launch a preset operation or issue any directive in the Command Nexus — it will be staged here.
                </p>
              </motion.div>
            )}
            {tasks.map((t, i) => (
              <TaskCard key={t.id} task={t} defaultOpen={i === 0} />
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}

function CustomOp() {
  const [v, setV] = useState('')
  const { core } = useHerc()
  const busy = core === 'thinking' || core === 'executing'
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!v.trim() || busy) return
        void herc.command(v)
        setV('')
      }}
      className="flex items-center gap-2"
    >
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="describe any operation…"
        disabled={busy}
        className="h-9 w-full rounded-md border border-white/10 bg-black/30 px-3 text-[11px] text-slate-100 outline-none placeholder:text-slate-600 focus:border-[hsl(var(--herc-hue)_80%_60%/0.5)]"
      />
      <button
        type="submit"
        disabled={busy || !v.trim()}
        className="herc-btn hud-panel h-9 shrink-0 rounded-md px-3 text-[9px] tracking-[0.2em] t-accent disabled:opacity-40"
      >
        STAGE
      </button>
    </form>
  )
}
