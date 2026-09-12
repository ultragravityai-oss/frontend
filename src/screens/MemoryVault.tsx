import { AnimatePresence, motion } from 'framer-motion'
import { BrainCircuit, Eraser, X } from 'lucide-react'
import { herc, useHerc } from '../lib/hercules/store'
import type { MemoryNode } from '../lib/hercules/types'

const KIND_COLOR: Record<MemoryNode['kind'], string> = {
  domain: 'hsl(var(--herc-hue) 95% 65%)',
  entity: 'hsl(var(--herc-hue) 60% 55%)',
  session: 'hsl(var(--herc-hue2) 95% 62%)',
}

export default function MemoryVault() {
  const { memory, selectedMemory, core } = useHerc()
  const sel = memory.find((m) => m.id === selectedMemory) ?? null
  const busy = core === 'thinking' || core === 'executing'
  const sessions = memory.filter((m) => m.kind === 'session').length

  return (
    <div className="grid h-full grid-cols-1 gap-3 overflow-hidden p-3 lg:grid-cols-[1fr_330px]">
      {/* graph */}
      <section className="hud-panel hud-corner relative min-h-[320px] overflow-hidden">
        <div className="absolute left-4 top-4 z-10">
          <div className="text-[9px] tracking-[0.3em] t-dim">KNOWLEDGE GRAPH // DEEP STORAGE</div>
          <h2 className="font-display mt-1 text-xl font-semibold tracking-[0.12em] text-slate-100">
            MEMORY <span className="t-accent">VAULT</span>
          </h2>
          <div className="mt-1 text-[9px] tracking-[0.2em] t-dim">
            {memory.length} NODES · {sessions} SESSION FRAGMENTS
          </div>
        </div>

        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* edges */}
          {memory
            .filter((m) => m.parent)
            .map((m) => {
              const p = memory.find((x) => x.id === m.parent)
              if (!p) return null
              const isSel = sel && (sel.id === m.id || sel.id === p.id)
              return (
                <line
                  key={`e-${m.id}`}
                  x1={p.x * 100}
                  y1={p.y * 100}
                  x2={m.x * 100}
                  y2={m.y * 100}
                  stroke={isSel ? 'hsl(var(--herc-hue2) 95% 62%)' : 'hsl(var(--herc-hue) 70% 55% / 0.25)'}
                  strokeWidth={isSel ? 0.45 : 0.18}
                  strokeDasharray={m.kind === 'session' ? '1.2 1' : undefined}
                />
              )
            })}
        </svg>

        {/* nodes (divs for crisp interaction) */}
        {memory.map((m) => {
          const size = 10 + m.weight * 26
          const isSel = sel?.id === m.id
          return (
            <motion.button
              key={m.id}
              layout
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              onClick={() => herc.selectMemory(isSel ? null : m.id)}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%`, width: size, height: size }}
              title={m.label}
            >
              <span
                className={`block h-full w-full rounded-full transition-all ${m.kind === 'domain' ? 'pulse-dot' : ''}`}
                style={{
                  background: `radial-gradient(circle at 35% 30%, #ffffffcc, ${KIND_COLOR[m.kind]} 45%, transparent 75%)`,
                  boxShadow: `0 0 ${isSel ? 26 : 12}px ${KIND_COLOR[m.kind]}`,
                  animationDuration: `${2.4 + m.weight * 3}s`,
                  outline: isSel ? `1px solid ${KIND_COLOR[m.kind]}` : 'none',
                  outlineOffset: 4,
                }}
              />
              {m.kind === 'domain' && (
                <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap text-[8px] tracking-[0.25em] text-slate-300">
                  {m.label.toUpperCase()}
                </span>
              )}
            </motion.button>
          )
        })}

        <div className="pointer-events-none absolute bottom-4 left-4 z-10 space-y-1 text-[8px] tracking-[0.2em] t-dim">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: KIND_COLOR.domain }} /> DOMAIN
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: KIND_COLOR.entity }} /> ENTITY
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: KIND_COLOR.session }} /> SESSION FRAGMENT
          </div>
        </div>
      </section>

      {/* inspector */}
      <aside className="flex min-h-0 flex-col gap-3">
        <AnimatePresence mode="wait">
          {sel ? (
            <motion.div
              key={sel.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className="hud-panel hud-corner relative p-4"
            >
              <button
                onClick={() => herc.selectMemory(null)}
                className="herc-btn absolute right-3 top-3 text-slate-500 hover:text-slate-200"
              >
                <X size={14} />
              </button>
              <div className="text-[8px] tracking-[0.3em]" style={{ color: KIND_COLOR[sel.kind] }}>
                {sel.kind.toUpperCase()} NODE
              </div>
              <h3 className="font-display mt-2 text-lg font-semibold tracking-wide text-slate-100">{sel.label}</h3>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{sel.note}</p>
              <div className="hud-divider my-3" />
              <div className="space-y-2 text-[9px] tracking-[0.1em] text-slate-500">
                <div className="flex justify-between">
                  <span>SALIENCE WEIGHT</span>
                  <span className="tabular-nums t-accent">{sel.weight.toFixed(2)}</span>
                </div>
                <div className="h-[3px] overflow-hidden rounded bg-white/5">
                  <div className="h-full rounded" style={{ width: `${sel.weight * 100}%`, background: KIND_COLOR[sel.kind] }} />
                </div>
                <div className="flex justify-between pt-1">
                  <span>LINKED EDGES</span>
                  <span className="tabular-nums text-slate-300">
                    {memory.filter((m) => m.parent === sel.id).length + (sel.parent ? 1 : 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GRAPH POSITION</span>
                  <span className="tabular-nums text-slate-300">
                    {sel.x.toFixed(2)} / {sel.y.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hud-panel flex flex-col items-center justify-center gap-3 p-6 text-center"
            >
              <BrainCircuit size={26} className="t-accent opacity-70" />
              <p className="text-[10px] leading-relaxed text-slate-400">
                Touch any node to inspect its crystallized contents. Amber nodes are fragments from
                this very session — the core writes them as you work together.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="hud-panel p-4">
          <div className="mb-2 text-[9px] tracking-[0.3em] t-dim">VAULT OPERATIONS</div>
          <button
            disabled={busy}
            onClick={() => void herc.command('Consolidate and crystallize my recent memories', 'text')}
            className="herc-btn mb-2 w-full rounded-md border border-[hsl(var(--herc-hue)_80%_60%/0.4)] bg-[hsl(var(--herc-hue)_80%_50%/0.08)] py-2.5 text-[10px] tracking-[0.2em] t-accent disabled:opacity-40"
          >
            RUN CONSOLIDATION CYCLE
          </button>
          <button
            onClick={() => herc.purgeVolatile()}
            className="herc-btn flex w-full items-center justify-center gap-2 rounded-md border border-red-400/25 bg-red-500/5 py-2.5 text-[10px] tracking-[0.2em] text-red-300/90 hover:bg-red-500/10"
          >
            <Eraser size={12} /> PURGE SESSION FRAGMENTS
          </button>
        </div>

        <div className="hud-panel hud-scroll min-h-0 flex-1 overflow-y-auto p-4">
          <div className="mb-2 text-[9px] tracking-[0.3em] t-dim">FRAGMENT INDEX</div>
          <div className="space-y-1.5">
            {memory
              .slice()
              .reverse()
              .map((m) => (
                <button
                  key={m.id}
                  onClick={() => herc.selectMemory(m.id)}
                  className={`herc-btn block w-full truncate rounded px-2 py-1.5 text-left text-[10px] ${
                    selectedMemory === m.id ? 'bg-[hsl(var(--herc-hue)_80%_50%/0.12)] text-slate-100' : 'text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <span style={{ color: KIND_COLOR[m.kind] }}>●</span> {m.label}
                </button>
              ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
