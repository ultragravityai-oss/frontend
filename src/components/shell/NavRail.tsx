import { motion } from 'framer-motion'
import {
  Activity,
  AudioWaveform,
  BrainCircuit,
  SlidersHorizontal,
  SquareTerminal,
  Workflow,
} from 'lucide-react'
import { herc, useHerc } from '../../lib/hercules/store'
import type { ScreenId } from '../../lib/hercules/types'

const ITEMS: Array<{ id: ScreenId; label: string; sub: string; icon: typeof Activity; num: string }> = [
  { id: 'command', label: 'COMMAND', sub: 'core nexus', icon: SquareTerminal, num: '01' },
  { id: 'execution', label: 'EXECUTION', sub: 'task deck', icon: Workflow, num: '02' },
  { id: 'neural', label: 'NEURAL', sub: 'substrate grid', icon: Activity, num: '03' },
  { id: 'memory', label: 'MEMORY', sub: 'knowledge vault', icon: BrainCircuit, num: '04' },
  { id: 'voice', label: 'VOICE LINK', sub: 'acoustic channel', icon: AudioWaveform, num: '05' },
  { id: 'core', label: 'CORE', sub: 'personality matrix', icon: SlidersHorizontal, num: '06' },
]

export default function NavRail() {
  const { screen, core } = useHerc()
  return (
    <nav className="hud-panel relative z-30 flex w-16 flex-col items-stretch gap-1 rounded-none border-y-0 border-l-0 py-3 lg:w-44">
      {ITEMS.map((item) => {
        const active = screen === item.id
        const Icon = item.icon
        return (
          <button
            key={item.id}
            onClick={() => herc.navigate(item.id)}
            className="herc-btn group relative mx-2 flex items-center gap-3 rounded-md px-2.5 py-2.5 text-left lg:mx-2"
          >
            {active && (
              <motion.div
                layoutId="nav-active"
                className="absolute inset-0 rounded-md border border-[hsl(var(--herc-hue)_80%_60%/0.35)] bg-[hsl(var(--herc-hue)_80%_55%/0.10)]"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative hidden text-[8px] t-dim lg:block">{item.num}</span>
            <Icon
              size={16}
              strokeWidth={1.5}
              className={`relative transition-colors ${active ? 't-accent' : 'text-slate-500 group-hover:text-slate-300'}`}
              style={active ? { filter: 'drop-shadow(0 0 6px hsl(var(--herc-hue) 95% 60% / 0.8))' } : undefined}
            />
            <span className="relative hidden lg:block">
              <span
                className={`block text-[10px] font-medium tracking-[0.22em] transition-colors ${
                  active ? 'text-slate-100' : 'text-slate-500 group-hover:text-slate-300'
                }`}
              >
                {item.label}
              </span>
              <span className="block text-[8px] tracking-[0.14em] t-dim">{item.sub}</span>
            </span>
            {active && core !== 'idle' && (
              <span className="absolute right-2 hidden h-1 w-1 rounded-full bg-[hsl(var(--herc-hue)_95%_65%)] pulse-dot lg:block" />
            )}
          </button>
        )
      })}

      <div className="mx-3 mt-auto hidden space-y-2 border-t border-white/5 pt-3 lg:block">
        <div className="text-[8px] tracking-[0.25em] t-dim">SESSION</div>
        <div className="text-[9px] leading-relaxed text-slate-500">
          lattice v9.4
          <br />
          operator-bound
          <br />
          <span className="t-accent">sovereign instance</span>
        </div>
      </div>
    </nav>
  )
}
