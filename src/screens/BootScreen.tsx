import { motion } from 'framer-motion'
import { Check, ChevronRight, Fingerprint } from 'lucide-react'
import Hologram from '../components/core/Hologram'
import { herc, useHerc } from '../lib/hercules/store'

export default function BootScreen() {
  const { phase, bootProgress, bootStages, settings } = useHerc()
  const dormant = phase === 'dormant'

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden scanlines vignette">
      {/* core projection */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[62vmin] w-[62vmin] -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease: 'easeOut' }}
      >
        <Hologram
          state={dormant ? 'offline' : 'booting'}
          hue={settings.hue}
          intensity={settings.intensity}
        />
      </motion.div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-2 text-center"
        >
          <div className="text-[10px] tracking-[0.5em] t-dim">SOVEREIGN INTELLIGENCE LATTICE</div>
          <h1 className="font-display mt-3 text-4xl font-semibold tracking-[0.3em] neon-text md:text-5xl">
            HERCULES
          </h1>
          <div className="mt-3 flex items-center justify-center gap-2 text-[8.5px] tracking-[0.3em] t-dim">
            <span className="t-accent">DOMINANT STRATEGIC</span>
            <span>◆</span>
            <span className="t-accent">CALM PRECISE</span>
            <span>◆</span>
            <span className="t-accent">WARM SENTIENT</span>
          </div>
        </motion.div>

        {dormant ? (
          <motion.div
            className="mt-72 flex flex-col items-center sm:mt-80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <p className="mb-6 max-w-xs text-center text-[11px] leading-relaxed text-slate-400">
              The core is dormant. Seven subsystems await ignition. Your machine has never had a mind —
              it is about to.
            </p>
            <button
              onClick={() => void herc.initialize()}
              className="herc-btn hud-panel hud-corner group relative flex items-center gap-3 px-7 py-3.5"
            >
              <Fingerprint size={17} className="t-accent" />
              <span className="text-[12px] font-semibold tracking-[0.3em] text-slate-100">INITIALIZE CORE</span>
              <ChevronRight size={15} className="t-accent transition-transform group-hover:translate-x-1" />
              <span className="absolute inset-0 -z-10 rounded-[10px] bg-[hsl(var(--herc-hue)_90%_55%/0.06)]" />
            </button>
            <div className="mt-5 text-[9px] tracking-[0.3em] t-dim">OPERATOR IDENTITY WILL BE BOUND</div>
          </motion.div>
        ) : (
          <div className="mt-64 w-full sm:mt-72">
            <div className="mb-4 flex items-end justify-between">
              <span className="text-[10px] tracking-[0.35em] t-accent glow">BOOT SEQUENCE ENGAGED</span>
              <span className="font-display text-2xl font-semibold tabular-nums text-slate-100">
                {Math.floor(bootProgress)}
                <span className="text-sm t-dim">%</span>
              </span>
            </div>
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full transition-[width] duration-75"
                style={{
                  width: `${bootProgress}%`,
                  background: 'linear-gradient(90deg, hsl(var(--herc-hue) 90% 45%), hsl(var(--herc-hue) 100% 70%))',
                  boxShadow: '0 0 14px hsl(var(--herc-hue) 95% 60% / 0.9)',
                }}
              />
            </div>
            <div className="mt-6 space-y-1.5">
              {bootStages.map((st, i) => {
                const active = !st.done && (i === 0 || bootStages[i - 1].done)
                return (
                  <motion.div
                    key={st.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: st.done || active ? 1 : 0.3, x: 0 }}
                    className="flex items-center gap-3 text-[11px]"
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                        st.done
                          ? 'border-[hsl(var(--herc-hue)_90%_60%/0.7)] bg-[hsl(var(--herc-hue)_90%_55%/0.2)]'
                          : active
                            ? 'border-[hsl(var(--herc-hue)_90%_60%/0.5)]'
                            : 'border-white/10'
                      }`}
                    >
                      {st.done && <Check size={10} className="t-accent" />}
                      {active && <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--herc-hue)_95%_65%)] pulse-dot" />}
                    </span>
                    <span className={st.done ? 'text-slate-300' : active ? 't-accent' : 't-dim'}>
                      {st.label.toUpperCase()}
                    </span>
                    {active && <span className="caret t-accent">▍</span>}
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* corner telemetry */}
      <div className="absolute bottom-5 left-6 z-10 text-[9px] leading-relaxed tracking-[0.2em] t-dim">
        LATTICE v9.4.1 // KERNEL SOVEREIGN
        <br />
        QUANTUM SUBSTRATE: ARMED
      </div>
      <div className="absolute bottom-5 right-6 z-10 text-right text-[9px] leading-relaxed tracking-[0.2em] t-dim">
        © HERCULES DYNAMICS
        <br />
        ONE OPERATOR. ONE MIND.
      </div>
    </div>
  )
}
