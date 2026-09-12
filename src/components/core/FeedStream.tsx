import { useEffect, useRef } from 'react'
import { useHerc } from '../../lib/hercules/store'
import type { FeedItem } from '../../lib/hercules/types'

function ts(t: number) {
  const d = new Date(t)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

function Item({ item }: { item: FeedItem }) {
  const base = 'rise-in rounded-md border px-3 py-2'
  if (item.kind === 'user' || item.kind === 'vox') {
    return (
      <div className={`${base} ml-6 border-[hsl(var(--herc-hue2)_80%_55%/0.25)] bg-[hsl(var(--herc-hue2)_80%_50%/0.06)]`}>
        <div className="mb-1 flex items-center justify-between text-[8px] tracking-[0.25em]">
          <span className="t-accent2">{item.kind === 'vox' ? 'OPERATOR · VOX' : 'OPERATOR'}</span>
          <span className="t-dim tabular-nums">{ts(item.ts)}</span>
        </div>
        <p className="text-[12px] leading-relaxed text-amber-50/90">{item.text}</p>
      </div>
    )
  }
  if (item.kind === 'hercules') {
    return (
      <div className={`${base} mr-6 border-[hsl(var(--herc-hue)_80%_60%/0.3)] bg-[hsl(var(--herc-hue)_80%_50%/0.07)]`}>
        <div className="mb-1 flex items-center justify-between text-[8px] tracking-[0.25em]">
          <span className="t-accent glow">HERCULES {item.title ? `· ${item.title}` : ''}</span>
          <span className="t-dim tabular-nums">{ts(item.ts)}</span>
        </div>
        <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-slate-200">
          {item.text}
          {item.streaming && <span className="caret t-accent"> ▍</span>}
        </p>
      </div>
    )
  }
  if (item.kind === 'system') {
    return (
      <div className="rise-in flex items-center gap-2 px-1 py-0.5 text-[9px] tracking-[0.22em] text-slate-500">
        <span className="h-px flex-1 bg-white/5" />
        <span className="shrink-0">{item.text}</span>
        <span className="h-px flex-1 bg-white/5" />
      </div>
    )
  }
  return (
    <div className="rise-in flex items-baseline gap-2 px-1 py-0.5 text-[9.5px] text-slate-500">
      <span className="t-accent tabular-nums opacity-60">{ts(item.ts)}</span>
      <span className="tracking-wide">{item.text}</span>
    </div>
  )
}

export default function FeedStream({ className = '' }: { className?: string }) {
  const { feed } = useHerc()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (el) el.scrollTop = el.scrollHeight
  }, [feed])

  return (
    <div ref={ref} className={`hud-scroll space-y-2 overflow-y-auto pr-1 ${className}`}>
      {feed.length === 0 && (
        <div className="flex h-full items-center justify-center text-[10px] tracking-[0.3em] t-dim">
          CHANNEL OPEN — SILENCE
        </div>
      )}
      {feed.map((f) => (
        <Item key={f.id} item={f} />
      ))}
    </div>
  )
}
