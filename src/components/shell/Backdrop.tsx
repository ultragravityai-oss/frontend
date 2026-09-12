export default function Backdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* deep space gradient field */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 70% at 50% 0%, hsl(var(--herc-hue) 65% 11% / 0.6) 0%, transparent 55%),' +
            'radial-gradient(60% 50% at 85% 90%, hsl(var(--herc-hue2) 60% 9% / 0.45) 0%, transparent 60%),' +
            'radial-gradient(70% 60% at 8% 80%, hsl(var(--herc-hue) 70% 10% / 0.4) 0%, transparent 55%),' +
            '#04060b',
        }}
      />

      {/* cinematic aurora clouds */}
      <div
        className="aurora-a absolute left-[8%] top-[-18%] h-[55vh] w-[52vw] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, hsl(var(--herc-hue) 90% 45% / 0.13), hsl(var(--herc-hue) 90% 40% / 0.05) 55%, transparent 75%)',
        }}
      />
      <div
        className="aurora-b absolute right-[-6%] bottom-[-22%] h-[60vh] w-[46vw] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, hsl(var(--herc-hue2) 95% 50% / 0.10), hsl(var(--herc-hue2) 90% 45% / 0.04) 55%, transparent 75%)',
        }}
      />

      <div className="absolute inset-0 hud-grid opacity-70" />

      {/* drifting light shafts */}
      <div
        className="absolute -left-40 top-0 h-[140%] w-72 rotate-12 opacity-[0.05]"
        style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--herc-hue) 90% 60%), transparent)' }}
      />
      <div
        className="absolute right-24 top-0 h-[140%] w-40 -rotate-6 opacity-[0.035]"
        style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--herc-hue) 90% 60%), transparent)' }}
      />

      {/* occasional cinematic scan beam */}
      <div
        className="beam-sweep absolute left-0 top-0 h-28 w-full opacity-[0.06]"
        style={{ background: 'linear-gradient(180deg, transparent, hsl(var(--herc-hue) 95% 65%), transparent)' }}
      />
    </div>
  )
}
