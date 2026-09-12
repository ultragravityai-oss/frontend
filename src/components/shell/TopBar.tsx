import { useEffect, useState } from 'react'
import { Hexagon, Power, ShieldCheck, Timer } from 'lucide-react'
import { herc, useHerc } from '../../lib/hercules/store'

const STATE_LABEL: Record<string, string> = {
  offline: 'OFFLINE',
  booting: 'BOOT SEQUENCE',
  idle: 'IDLE // AWAITING DIRECTIVE',
  listening: 'LISTENING',
  thinking: 'REASONING',
  executing: 'EXECUTING',
  speaking: 'RESPONDING',
}

function formatUptime(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function traitLine(dominance: number, precision: number, warmth: number) {
  const parts: string[] = []
  parts.push(dominance >= 60 ? 'DOMINANT' : 'MEASURED')
  parts.push(precision >= 60 ? 'PRECISE' : 'FLUID')
  parts.push(warmth >= 50 ? 'SENTIENT' : 'STOIC')
  return parts.join(' · ')
}

export default function TopBar() {
  const { core, uptime, settings } = useHerc()
  const [clock, setClock] = useState('')
  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setClock(
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`,
      )
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [])

  return (
    <header className="hud-panel relative z-30 flex h-14 items-center justify-between gap-4 rounded-none border-x-0 border-t-0 px-4">
      {/* wordmark */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Hexagon size={26} strokeWidth={1.2} className="t-accent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--herc-hue)_95%_70%)] shadow-[0_0_10px_hsl(var(--herc-hue)_95%_60%)]" />
          </div>
        </div>
        <div className="leading-none">
          <div className="font-display text-[15px] font-semibold tracking-[0.35em] text-slate-100 glow-soft">
            HERCULES
          </div>
          <div className="mt-1 text-[9px] tracking-[0.3em] t-dim">AUTONOMOUS COMMAND INTELLIGENCE</div>
        </div>
      </div>

      {/* core state + persona */}
      <div className="hidden flex-col items-center gap-1 md:flex">
        <div className="flex items-center gap-3">
          <div
            className="h-2 w-2 rounded-full pulse-dot"
            style={{
              background: 'var(--acc)',
              boxShadow: '0 0 12px var(--acc)',
              animationDuration: core === 'idle' ? '2.4s' : '0.7s',
            }}
          />
          <span className="text-[11px] tracking-[0.28em] t-accent flicker">{STATE_LABEL[core]}</span>
        </div>
        <span className="text-[8px] tracking-[0.34em] t-dim">
          {traitLine(settings.dominance, settings.precision, settings.warmth)}
        </span>
      </div>

      {/* right cluster */}
      <div className="flex items-center gap-5 text-[10px] tracking-[0.18em] t-dim">
        <div className="hidden items-center gap-2 lg:flex">
          <ShieldCheck size={13} className="t-accent" />
          <span>INTEGRITY 99.97%</span>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <Timer size={13} className="t-accent" />
          <span className="tabular-nums">UP {formatUptime(uptime)}</span>
        </div>
        <div className="tabular-nums text-slate-300">{clock}</div>
        <button
          onClick={() => herc.reboot()}
          title="Power-cycle the core"
          className="herc-btn flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-slate-400 hover:border-red-400/50 hover:text-red-300"
        >
          <Power size={14} />
        </button>
      </div>
      {settings.hum && (
        <div className="absolute bottom-0 left-1/2 h-px w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-[hsl(var(--herc-hue)_95%_65%/0.8)] to-transparent" />
      )}
    </header>
  )
}
