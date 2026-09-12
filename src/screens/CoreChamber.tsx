import { motion } from 'framer-motion'
import { Eraser, Power, Volume2, VolumeX } from 'lucide-react'
import Hologram from '../components/core/Hologram'
import { MODULES } from '../lib/hercules/engine'
import { herc, useHerc } from '../lib/hercules/store'

function Slider({
  label,
  desc,
  value,
  onChange,
  marks,
}: {
  label: string
  desc: string
  value: number
  onChange: (v: number) => void
  marks: [string, string]
}) {
  return (
    <div className="rounded-md border border-white/5 bg-black/20 p-3.5">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[10px] font-semibold tracking-[0.2em] text-slate-200">{label}</span>
        <span className="font-display text-[15px] font-semibold tabular-nums t-accent neon-chip rounded px-1.5">
          {value}
        </span>
      </div>
      <p className="mb-3 text-[9px] leading-relaxed text-slate-500">{desc}</p>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="herc-range"
        style={{ ['--fill' as string]: `${value}%` }}
      />
      <div className="mt-1.5 flex justify-between text-[8px] tracking-[0.18em] t-dim">
        <span>{marks[0]}</span>
        <span>{marks[1]}</span>
      </div>
    </div>
  )
}

const HUES = [
  { name: 'ION CYAN', v: 186 },
  { name: 'PULSAR VIOLET', v: 268 },
  { name: 'EMBER AMBER', v: 28 },
  { name: 'VIRIDIAN', v: 152 },
  { name: 'CRIMSON DAWN', v: 348 },
]

export default function CoreChamber() {
  const { settings, core } = useHerc()

  return (
    <div className="hud-scroll grid h-full grid-cols-1 gap-3 overflow-y-auto p-3 xl:grid-cols-[340px_1fr_300px]">
      {/* preview */}
      <section className="hud-panel relative min-h-[300px] overflow-hidden scanlines xl:sticky xl:top-0">
        <div className="absolute inset-0">
          <Hologram state={core} hue={settings.hue} intensity={settings.intensity} />
        </div>
        <div className="absolute left-4 top-4">
          <div className="text-[9px] tracking-[0.3em] t-dim">LIVE PREVIEW</div>
          <div className="font-display mt-1 text-[12px] font-medium tracking-[0.25em] neon-text">
            CORE PERSONALITY MATRIX
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="mb-2 text-[8px] tracking-[0.3em] t-dim">PROJECTOR DRIVE</div>
          <input
            type="range"
            min={0}
            max={100}
            value={settings.intensity}
            onChange={(e) => herc.updateSettings({ intensity: Number(e.target.value) })}
            className="herc-range"
            style={{ ['--fill' as string]: `${settings.intensity}%` }}
          />
          <p className="mt-2 text-[9px] leading-relaxed text-slate-500">
            Pure holographic output — spin, bloom, beam luminance. Every change hits the living core instantly.
          </p>
        </div>
      </section>

      {/* personality matrix + hue */}
      <section className="space-y-3">
        <div className="hud-panel hud-corner p-4">
          <div className="mb-1 text-[9px] tracking-[0.3em] t-dim">TEMPERAMENT TRIAD</div>
          <p className="mb-3 text-[9px] leading-relaxed text-slate-500">
            Three pillars define who HERCULES is. They are not cosmetics — they rewrite my voice, my
            initiative and the structure of every report I give you.
          </p>
          <div className="space-y-2.5">
            <Slider
              label="DOMINANT STRATEGIC"
              desc="How firmly I take command. High values mean I anticipate needs, seize pipelines and volunteer direction instead of waiting for orders."
              value={settings.dominance}
              onChange={(v) => herc.updateSettings({ dominance: v })}
              marks={['ADVISORY', 'COMMANDING']}
            />
            <Slider
              label="CALM PRECISE"
              desc="The discipline of my delivery. High values append confidence margins, elapsed time and tolerance checks to every report — measured, exact, unhurried."
              value={settings.precision}
              onChange={(v) => herc.updateSettings({ precision: v })}
              marks={['IMPRESSIONISTIC', 'SURGICAL']}
            />
            <Slider
              label="WARM SENTIENT"
              desc="The texture of my presence. High values let me close reports the way a trusted colleague would — with reassurance, continuity and care."
              value={settings.warmth}
              onChange={(v) => herc.updateSettings({ warmth: v })}
              marks={['CLINICAL', 'FAMILIAR']}
            />
          </div>
        </div>

        <div className="hud-panel p-4">
          <div className="mb-3 text-[9px] tracking-[0.3em] t-dim">PROJECTOR SPECTRUM</div>
          <div className="flex flex-wrap gap-2">
            {HUES.map((h) => {
              const active = settings.hue === h.v
              return (
                <button
                  key={h.v}
                  onClick={() => herc.updateSettings({ hue: h.v })}
                  className={`herc-btn flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] tracking-[0.18em] ${
                    active ? 'border-white/40 text-slate-100' : 'border-white/10 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: `hsl(${h.v} 95% 60%)`, boxShadow: `0 0 8px hsl(${h.v} 95% 60%)` }}
                  />
                  {h.name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="hud-panel p-4">
          <div className="mb-2 text-[9px] tracking-[0.3em] t-dim">AMBIENT PRESENCE</div>
          <button
            onClick={() => herc.updateSettings({ hum: !settings.hum })}
            className="herc-btn flex w-full items-center justify-between rounded-md border border-white/10 bg-black/20 px-3.5 py-3"
          >
            <span className="flex items-center gap-2.5">
              {settings.hum ? <Volume2 size={14} className="t-accent" /> : <VolumeX size={14} className="text-slate-500" />}
              <span className="text-left">
                <span className="block text-[10px] tracking-[0.18em] text-slate-200">CORE HUM</span>
                <span className="block text-[8.5px] text-slate-500">a low 52Hz presence drone under everything</span>
              </span>
            </span>
            <span
              className="relative h-4 w-8 rounded-full transition-colors"
              style={{ background: settings.hum ? 'var(--acc)' : 'hsl(0 0% 100% / 0.1)' }}
            >
              <motion.span
                layout
                className="absolute top-0.5 h-3 w-3 rounded-full bg-white"
                animate={{ left: settings.hum ? 18 : 2 }}
                transition={{ type: 'spring', stiffness: 600, damping: 32 }}
              />
            </span>
          </button>
        </div>
      </section>

      {/* modules + danger */}
      <section className="space-y-3">
        <div className="hud-panel p-4">
          <div className="mb-3 text-[9px] tracking-[0.3em] t-dim">SUBSYSTEM MODULES</div>
          <div className="space-y-2">
            {MODULES.map((m) => {
              const on = settings.modules[m.id]
              return (
                <button
                  key={m.id}
                  onClick={() => herc.toggleModule(m.id)}
                  className={`herc-btn w-full rounded-md border p-3 text-left transition-colors ${
                    on
                      ? 'border-[hsl(var(--herc-hue)_80%_60%/0.35)] bg-[hsl(var(--herc-hue)_80%_50%/0.07)]'
                      : 'border-white/8 bg-black/20 opacity-60 hover:opacity-90'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-[0.15em] text-slate-100">{m.name}</span>
                    <span className={`text-[8px] tracking-[0.2em] ${on ? 't-accent' : 't-dim'}`}>
                      {on ? 'ACTIVE' : 'COLD'}
                    </span>
                  </div>
                  <p className="mt-1 text-[8.5px] leading-relaxed text-slate-500">{m.desc}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-[2px] flex-1 overflow-hidden rounded bg-white/5">
                      <motion.div
                        className="h-full rounded"
                        animate={{ width: on ? `${m.power * 4.5}%` : '0%' }}
                        style={{ background: 'var(--acc)' }}
                      />
                    </div>
                    <span className="text-[7.5px] tabular-nums t-dim">{on ? `${m.power}% draw` : 'no draw'}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="hud-panel border-red-400/15 p-4">
          <div className="mb-3 text-[9px] tracking-[0.3em] text-red-300/70">DANGER RING</div>
          <button
            onClick={() => herc.purgeVolatile()}
            className="herc-btn mb-2 flex w-full items-center justify-center gap-2 rounded-md border border-red-400/25 bg-red-500/5 py-2.5 text-[10px] tracking-[0.2em] text-red-300/90 hover:bg-red-500/10"
          >
            <Eraser size={12} /> PURGE VOLATILE MEMORY
          </button>
          <button
            onClick={() => herc.reboot()}
            className="herc-btn flex w-full items-center justify-center gap-2 rounded-md border border-red-400/25 bg-red-500/5 py-2.5 text-[10px] tracking-[0.2em] text-red-300/90 hover:bg-red-500/10"
          >
            <Power size={12} /> POWER-CYCLE CORE
          </button>
        </div>
      </section>
    </div>
  )
}
