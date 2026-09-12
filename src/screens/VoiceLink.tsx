import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, SendHorizonal } from 'lucide-react'
import FeedStream from '../components/core/FeedStream'
import Hologram from '../components/core/Hologram'
import { herc, useHerc } from '../lib/hercules/store'

const PHRASES = [
  'Run a deep scan of all sectors',
  'Analyze tonight’s anomalous traffic',
  'Harden the security perimeter',
  'Summarize the current situation',
]

function Waveform({ level, active, hue }: { level: number; active: boolean; hue: number }) {
  const bars = 56
  const t = Date.now() / 120
  return (
    <div className="flex h-16 items-center justify-center gap-[3px]">
      {Array.from({ length: bars }).map((_, i) => {
        const center = 1 - Math.abs(i - bars / 2) / (bars / 2)
        const wave = Math.abs(Math.sin(t * 0.9 + i * 0.55) * Math.cos(t * 0.4 + i * 0.2))
        const h = active ? 4 + (wave * 0.7 + level * 0.6) * center * 56 : 3 + center * 5
        return (
          <div
            key={i}
            className="w-[3px] rounded-full transition-[height] duration-75"
            style={{
              height: `${h}px`,
              background: `hsla(${hue}, 95%, ${60 + center * 15}%, ${active ? 0.25 + center * 0.65 : 0.18})`,
              boxShadow: active && center > 0.7 ? `0 0 8px hsla(${hue},95%,60%,0.8)` : undefined,
            }}
          />
        )
      })}
    </div>
  )
}

export default function VoiceLink() {
  const { core, voiceActive, voiceLevel, settings } = useHerc()
  const [typed, setTyped] = useState('')
  const busy = core === 'thinking' || core === 'executing' || core === 'speaking'

  const sendTyped = (e: FormEvent) => {
    e.preventDefault()
    if (!typed.trim() || busy || voiceActive) return
    void herc.command(typed, 'vox')
    setTyped('')
  }

  return (
    <div className="grid h-full grid-cols-1 gap-3 overflow-hidden p-3 lg:grid-cols-[1fr_360px]">
      {/* acoustic stage */}
      <section className="hud-panel relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden scanlines">
        <div className="absolute inset-0">
          <Hologram
            state={voiceActive ? 'listening' : core}
            hue={settings.hue}
            intensity={settings.intensity}
            voiceLevel={voiceActive ? voiceLevel : 0}
          />
        </div>

        <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 text-center">
          <div className="text-[9px] tracking-[0.45em] t-dim">ACOUSTIC CHANNEL</div>
          <motion.div
            key={voiceActive ? 'on' : 'off'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`font-display mt-1 text-[13px] font-medium tracking-[0.3em] ${voiceActive ? 't-accent2' : 't-accent'} glow`}
          >
            {voiceActive ? 'I AM LISTENING — SPEAK' : busy ? 'CORE OCCUPIED' : 'CHANNEL COLD'}
          </motion.div>
        </div>

        <div className="absolute bottom-24 left-1/2 w-[min(90%,520px)] -translate-x-1/2">
          <Waveform level={voiceLevel} active={voiceActive} hue={voiceActive ? 36 : settings.hue} />
        </div>

        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3">
          {!voiceActive ? (
            <button
              onClick={() => herc.beginVoiceLink()}
              disabled={busy}
              className="herc-btn hud-panel hud-corner flex items-center gap-2.5 px-6 py-3 disabled:opacity-40"
            >
              <Mic size={15} className="t-accent" />
              <span className="text-[11px] font-semibold tracking-[0.25em] text-slate-100">INITIATE VOICE LINK</span>
            </button>
          ) : (
            <button
              onClick={() => herc.endVoiceLink()}
              className="herc-btn flex items-center gap-2.5 rounded-[10px] border border-red-400/40 bg-red-500/10 px-6 py-3"
            >
              <MicOff size={15} className="text-red-300" />
              <span className="text-[11px] font-semibold tracking-[0.25em] text-red-200">SEVER LINK</span>
            </button>
          )}
        </div>
      </section>

      {/* side console */}
      <aside className="flex min-h-0 flex-col gap-3">
        <div className="hud-panel hud-corner p-4">
          <div className="mb-2 text-[9px] tracking-[0.3em] t-dim">SPEECH SHORTHAND</div>
          <p className="mb-3 text-[10px] leading-relaxed text-slate-500">
            No microphone handy? Tap a phrase and the core will treat it as spoken — full voice
            pipeline, acoustic parse included.
          </p>
          <div className="space-y-1.5">
            {PHRASES.map((p) => (
              <button
                key={p}
                disabled={busy || voiceActive}
                onClick={() => void herc.command(p, 'vox')}
                className="herc-btn block w-full rounded-md border border-white/8 bg-black/20 px-3 py-2 text-left text-[10.5px] text-slate-300 hover:border-[hsl(var(--herc-hue)_80%_60%/0.4)] hover:text-slate-100 disabled:opacity-40"
              >
                “{p}”
              </button>
            ))}
          </div>
          <form onSubmit={sendTyped} className="mt-3 flex items-center gap-2">
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="type words as if spoken…"
              disabled={busy || voiceActive}
              className="h-9 w-full rounded-md border border-white/10 bg-black/30 px-3 text-[11px] text-slate-100 outline-none placeholder:text-slate-600 focus:border-[hsl(var(--herc-hue2)_80%_60%/0.5)] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={busy || voiceActive || !typed.trim()}
              className="herc-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[hsl(var(--herc-hue2)_80%_60%/0.4)] bg-[hsl(var(--herc-hue2)_80%_50%/0.08)] t-accent2 disabled:opacity-40"
            >
              <SendHorizonal size={13} />
            </button>
          </form>
        </div>

        <div className="hud-panel flex min-h-0 flex-1 flex-col p-3">
          <div className="mb-2 text-[9px] tracking-[0.3em] t-dim">CHANNEL TRANSCRIPT</div>
          <FeedStream className="min-h-0 flex-1" />
        </div>
      </aside>
    </div>
  )
}
