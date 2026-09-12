import type {
  BootStage,
  CoreState,
  FeedItem,
  FeedKind,
  HTask,
  HercSettings,
  HercSnapshot,
  MemoryNode,
  ModuleDef,
  ScreenId,
  SysStat,
  TaskStep,
} from './types'

/* ============================================================
   HERCULES CORE — front-end service layer
   Behaves as if a persistent backend exists. Every method
   resolves asynchronously and mutates shared reactive state.
   ============================================================ */

const rnd = (a: number, b: number) => a + Math.random() * (b - a)
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const uid = () => Math.random().toString(36).slice(2, 10)
const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))

/* ---------------- intents knowledge ---------------- */

export interface IntentDef {
  match: RegExp
  intent: string
  title: (q: string) => string
  steps: string[]
  stepDetails: string[]
  report: (q: string, core?: HerculesCore) => string[]
  summary: string
}

const INTENTS: IntentDef[] = [
  {
    match: /scan|sweep|diagnos|inspect|health/i,
    intent: 'DEEP SCAN',
    title: () => 'Full spectrum diagnostic sweep',
    steps: [
      'Spinning up sensor lattice',
      'Probing 4,096 address sectors',
      'Cross-checking integrity checksums',
      'Isolating anomalous signatures',
      'Rebuilding sector topology map',
      'Compiling diagnostic digest',
    ],
    stepDetails: ['lattice.warm()', 'io.probe(all)', 'sha.diff(tree)', 'heuristic.flag(Δ>3σ)', 'graph.rebuild()', 'digest.emit()'],
    report: () => [
      'Sweep complete. 4,096 sectors interrogated in parallel — 99.2% returned nominal checksums.',
      'Three low-grade irregularities surfaced in the peripheral bus: two stale cache leases, one orphaned socket handle. I have already re-absorbed all three.',
      'Thermal envelope is stable at 0.94 below throttle threshold. No action required from you.',
      'I have folded this scan into long-term memory — future sweeps will diff against tonight’s baseline.',
    ],
    summary: 'All sectors nominal · 3 anomalies auto-resolved',
  },
  {
    match: /analy|assess|evaluat|audit|review/i,
    intent: 'ANALYSIS',
    title: () => 'Deep pattern analysis',
    steps: [
      'Ingesting target corpus',
      'Extracting feature vectors',
      'Running correlation matrix',
      'Stress-testing hypotheses',
      'Ranking signal candidates',
      'Synthesis pass',
    ],
    stepDetails: ['corpus.ingest()', 'vec.embed(768d)', 'corr.matrix()', 'hyp.falsify()', 'rank.topk(5)', 'synth.final()'],
    report: (q) => [
      `I dissected “${q.slice(0, 42)}” across 6 analytical lenses. Three dominant signals emerged from the noise.`,
      'Signal one carries a 0.87 confidence weight and correlates with patterns I archived 41 days ago — the recurrence is unlikely to be coincidence.',
      'Two outliers were discarded after falsification; one requires more data before I stake my name on it.',
      'Full vector map is parked in the Memory Vault under this session node if you want to walk it with me.',
    ],
    summary: '3 signals isolated · 1 archived correlation found',
  },
  {
    match: /deploy|launch|build|construct|ship|generate|create/i,
    intent: 'DEPLOYMENT',
    title: () => 'Autonomous construction pipeline',
    steps: [
      'Resolving dependency graph',
      'Allocating isolated build cell',
      'Compiling artifact layers',
      'Running adversarial self-tests',
      'Sealing and signing artifact',
      'Pushing to staging mesh',
    ],
    stepDetails: ['graph.topo()', 'cell.spawn(mem=2G)', 'build.parallel(8)', 'test.adversarial()', 'sign(ed25519)', 'mesh.push(staging)'],
    report: () => [
      'Construction pipeline finished green. The artifact assembled in 8 parallel layers and survived 214 adversarial self-tests — zero critical faults.',
      'I signed the build with the session key and parked it on the staging mesh. It is one word away from production.',
      'Rollback snapshot captured automatically. If it misbehaves, I can rewind reality in under 400 milliseconds.',
    ],
    summary: 'Artifact sealed · 214/214 tests green · staged',
  },
  {
    match: /research|investigat|learn|study|explore|find out/i,
    intent: 'RESEARCH',
    title: () => 'Multi-vector research dive',
    steps: [
      'Fanning out query vectors',
      'Harvesting knowledge shards',
      'Deduplicating and weighting sources',
      'Triangulating contradictions',
      'Compressing into briefing',
    ],
    stepDetails: ['fanout(12)', 'harvest.shards()', 'dedup.semantic()', 'triangulate()', 'brief.compress()'],
    report: (q) => [
      `Research dive on “${q.slice(0, 40)}” returned from the deep. I pulled 12 vector threads and reconciled them into one coherent picture.`,
      'Consensus across high-weight sources is strong — the few contradictions trace back to a single outdated shard, which I have flagged and down-weighted.',
      'The briefing is indexed in the Vault. Ask me to recall it later and I will surface it verbatim.',
    ],
    summary: '12 threads reconciled · briefing indexed',
  },
  {
    match: /secur|threat|protect|guard|defend|intrud|lock/i,
    intent: 'SENTINEL',
    title: () => 'Threat posture hardening',
    steps: [
      'Raising perimeter lattice',
      'Rotating ephemeral keys',
      'Tracing inbound handshake history',
      'Arming anomaly sentinels',
      'Verifying zero-trust posture',
    ],
    stepDetails: ['lattice.raise()', 'keys.rotate(ecdh)', 'trace.handshakes()', 'sentinel.arm(all)', 'zt.verify()'],
    report: () => [
      'Perimeter is now hardened. I rotated every ephemeral key, replayed the last 10,000 handshakes against known-bad heuristics, and found nothing wearing a mask.',
      'Sentinel watch is armed at heightened sensitivity. Anything that knocks unexpectedly will meet me first, not you.',
      'Posture report archived. I will re-verify the lattice every 90 seconds while this module stays active.',
    ],
    summary: 'Keys rotated · sentinels armed · perimeter clean',
  },
  {
    match: /optimi|accelerat|tune|clean|speed|fast/i,
    intent: 'OPTIMIZATION',
    title: () => 'Throughput optimization pass',
    steps: [
      'Profiling hot pathways',
      'Reclaiming dead allocations',
      'Rebalancing worker pools',
      'Warming predictive caches',
      'Verifying latency deltas',
    ],
    stepDetails: ['prof.flame()', 'gc.reclaim()', 'pool.rebalance()', 'cache.prewarm()', 'latency.assert()'],
    report: () => [
      'Optimization pass complete. I reclaimed 1.8 GB of dead allocation and rebalanced the worker pool toward your actual usage pattern, not the textbook one.',
      'Median response latency dropped 31%. The predictive cache is pre-warmed with the six operations you reach for most.',
      'I will keep profiling quietly in the background. If the curve bends the wrong way, I will catch it before you feel it.',
    ],
    summary: '+31% throughput · 1.8 GB reclaimed',
  },
  {
    match: /remember|memor|recall|note|forget|vault/i,
    intent: 'MEMORY',
    title: () => 'Memory consolidation cycle',
    steps: [
      'Scanning volatile buffer',
      'Scoring fragments by salience',
      'Linking to existing graph nodes',
      'Crystallizing into deep storage',
    ],
    stepDetails: ['buffer.scan()', 'salience.score()', 'graph.link()', 'vault.crystallize()'],
    report: () => [
      'Consolidation cycle finished. I combed the volatile buffer, promoted the fragments that matter, and dissolved the noise.',
      'New connective tissue now links this session to your Projects and Preferences domains — the graph in the Memory Vault shows the fresh edges pulsing.',
      'Nothing you told me was lost. Everything trivial was courteously escorted out.',
    ],
    summary: 'Fragments crystallized · graph edges renewed',
  },
  {
    match: /summar|brief|report|status|sitrep/i,
    intent: 'SYNTHESIS',
    title: () => 'Situational synthesis',
    steps: [
      'Aggregating session telemetry',
      'Weaving narrative thread',
      'Compressing to executive form',
    ],
    stepDetails: ['tele.aggregate()', 'weave()', 'compress.exec()'],
    report: (_q, core) => {
      const done = core ? core.state.tasks.filter((t) => t.status === 'done').length : 0
      return [
        `Situation report, as requested. Since activation I have completed ${done + 1} operations, held neural load within tolerance, and kept the perimeter quiet.`,
        'Core integrity holds at 99.97%. No subsystem has asked for your attention — which is exactly how I like it.',
        'I remain at idle-readiness. Give me something weighty to chew on.',
      ]
    },
    summary: 'All systems within tolerance · integrity 99.97%',
  },
]

const FALLBACK: IntentDef = {
  match: /.*/,
  intent: 'COGNITION',
  title: () => 'Open cognitive reasoning',
  steps: [
    'Parsing directive semantics',
    'Consulting reasoning lattice',
    'Drafting candidate resolutions',
    'Selecting optimal path',
  ],
  stepDetails: ['parse.sem()', 'lattice.query()', 'draft(n=4)', 'select.argmin(loss)'],
  report: (q) => [
    `I turned “${q.slice(0, 44)}” over in the reasoning lattice. It resists a single clean answer, so here is my honest position.`,
    'The intent resolves into two viable paths — one fast and shallow, one slow and exact. I have defaulted to the exact path and queued my reasoning in the feed.',
    'If you want the fast path instead, say the word. I adapt either way.',
  ],
  summary: 'Reasoning resolved · optimal path selected',
}

const GREETINGS = [
  'Understood. Running it through the lattice now.',
  'On it. I will surface the moment I have something worth your time.',
  'Acknowledged. Spinning up the machinery.',
  'Directive received. Engaging reasoning core.',
]

const DOMINANT_ACKS = [
  'Already in motion — I saw this need forming before you finished typing it.',
  'Consider it handled. I am marshalling the full lattice behind this.',
  'Good instinct. I have taken command of the pipeline; watch it resolve.',
  'Affirmed. I will drive this to completion and bring you the outcome, not the noise.',
]

const WARM_PREFIX = ['With pleasure —', 'Gladly.', 'Consider it mine now.']
const COLD_PREFIX = ['Affirmed.', 'Executing.', 'Copy.']

const WARM_CLOSERS = [
  'I will stay with it until it is perfect. You have my full attention.',
  'That is handled — breathe easy, I have the watch.',
  'I keep learning the shape of what you need. This one is yours.',
]

const WHISPERS = [
  'peripheral handshake · node CH-7 acknowledged',
  'entropy pool refreshed · 4,096 bits harvested',
  'predictive cache hit · saved 212ms of compute',
  'sentinel sweep · 0 anomalies on the wire',
  'memory defragmenter passed · heap cohesion 98.4%',
  'thermal bloom within envelope · no throttle issued',
  'deep-index crawler summarized 3 dormant nodes',
  'clock discipline check · drift 0.0003%',
]

const VOICE_DIRECTIVES = [
  'Run a deep scan of all sectors',
  'Analyze tonight’s anomalous traffic',
  'Optimize the throughput profile',
  'Summarize the current situation',
  'Harden the security perimeter',
]

export const MODULES: ModuleDef[] = [
  { id: 'quantum', name: 'Quantum Reasoning Lattice', desc: 'Parallel hypothesis evaluation across the core lattice.', power: 18 },
  { id: 'deepmem', name: 'Deep Memory Indexing', desc: 'Continuous background crystallization of the knowledge graph.', power: 9 },
  { id: 'predictive', name: 'Predictive Precompute', desc: 'Speculatively executes likely next directives before you ask.', power: 14 },
  { id: 'sentinel', name: 'Sentinel Watch', desc: 'Perimeter anomaly detection with autonomous response authority.', power: 7 },
  { id: 'dreamstate', name: 'Dream-State Defrag', desc: 'Consolidates and re-indexes memory while the core is idle.', power: 5 },
  { id: 'overmesh', name: 'Overmesh Uplink', desc: 'Keeps a low-bandwidth sync channel to external knowledge shards.', power: 11 },
]

/* ---------------- memory seed ---------------- */

function seedMemory(): MemoryNode[] {
  const nodes: MemoryNode[] = []
  const domains: Array<[string, string, number, number]> = [
    ['Identity', 'who you are to me', 0.5, 0.5],
    ['Projects', 'active constructions and deployments', 0.22, 0.3],
    ['Preferences', 'how you like me to operate', 0.78, 0.28],
    ['Security', 'keys, postures, trust decisions', 0.24, 0.74],
    ['Environment', 'the machine and world around us', 0.76, 0.72],
  ]
  domains.forEach(([label, note, x, y], i) => {
    nodes.push({ id: `dom-${i}`, label, kind: 'domain', weight: 0.9, x, y, note })
  })
  const children: Array<[string, number, string, number, number]> = [
    ['Operator profile', 0, 'biometric cadence · wake patterns · decision style', 0.42, 0.36],
    ['Voice signature', 0, 'pitch envelope locked · 99.1% match confidence', 0.6, 0.66],
    ['Aurora rebuild', 1, 'staged artifact · awaiting production word', 0.12, 0.22],
    ['Night-train pipeline', 1, 'runs 02:00 daily · last run green', 0.3, 0.14],
    ['Minimal verbosity', 2, 'you asked me to skip filler — logged', 0.86, 0.16],
    ['Thermal anxiety', 2, 'you watch thermals · I preempt-throttle for you', 0.92, 0.42],
    ['Posture: zero-trust', 3, 'default deny · rotate keys every cycle', 0.12, 0.82],
    ['Handoff protocol', 3, 'dual-confirm before external entanglement', 0.32, 0.9],
    ['Locale mesh', 4, '3 nodes reachable · 47ms median', 0.84, 0.84],
    ['Ambient sensors', 4, 'temp / noise / light telemetry flowing', 0.66, 0.88],
  ]
  children.forEach(([label, p, note, x, y], i) => {
    nodes.push({
      id: `ent-${i}`,
      label,
      kind: 'entity',
      weight: rnd(0.35, 0.6),
      x,
      y,
      parent: `dom-${p}`,
      note,
    })
  })
  return nodes
}

/* ---------------- core ---------------- */

const MAX_FEED = 120

type Listener = () => void

class HerculesCore {
  state: HercSnapshot = {
    phase: 'dormant',
    core: 'offline',
    screen: 'command',
    feed: [],
    tasks: [],
    stats: this.seedStats(),
    memory: seedMemory(),
    settings: {
      dominance: 74,
      precision: 82,
      warmth: 58,
      intensity: 62,
      hue: 186,
      hum: false,
      modules: { quantum: true, deepmem: true, predictive: false, sentinel: true, dreamstate: true, overmesh: false },
    },
    bootProgress: 0,
    bootStages: [],
    voiceLevel: 0,
    voiceActive: false,
    uptime: 0,
    sessionLog: [],
    selectedMemory: null,
  }

  private listeners = new Set<Listener>()
  private timers: number[] = []
  private humCtx: AudioContext | null = null
  private humNodes: { osc: OscillatorNode; gain: GainNode } | null = null
  private taskCounter = 1
  private voiceTimer: number | null = null

  /* ---- reactivity ---- */
  subscribe = (fn: Listener) => {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }
  private touch() {
    this.state = { ...this.state }
    this.listeners.forEach((f) => f())
  }

  private seedStats(): SysStat[] {
    const mk = (key: string, label: string, unit: string, v: number, max = 100, accent = false): SysStat => ({
      key,
      label,
      unit,
      value: v,
      max,
      accent,
      history: Array.from({ length: 48 }, () => Math.max(2, v + rnd(-6, 6))),
    })
    return [
      mk('neural', 'NEURAL LOAD', '%', 34, 100, true),
      mk('cpu', 'COMPUTE FABRIC', '%', 41),
      mk('mem', 'MEMORY WEAVE', '%', 57),
      mk('io', 'I/O THROUGHPUT', 'GB/s', 2.4, 10, true),
      mk('thermal', 'THERMAL BLOOM', '°C', 41, 95),
      mk('mesh', 'MESH LATENCY', 'ms', 47, 200),
    ]
  }

  /* ---- helpers ---- */
  private pushFeed(kind: FeedKind, text: string, title?: string, streaming = false): string {
    const id = uid()
    const item: FeedItem = { id, ts: Date.now(), kind, text, title, streaming }
    let feed = [...this.state.feed, item]
    if (feed.length > MAX_FEED) feed = feed.slice(feed.length - MAX_FEED)
    this.state = { ...this.state, feed }
    this.touch()
    return id
  }

  private patchFeed(id: string, text: string, done = false) {
    const feed = this.state.feed.map((f) => (f.id === id ? { ...f, text, streaming: !done } : f))
    this.state = { ...this.state, feed }
    this.touch()
  }

  async streamMessage(kind: FeedKind, lines: string[], title?: string, cps = 90) {
    const full = lines.join('\n')
    const id = this.pushFeed(kind, '', title, true)
    const step = Math.max(1, Math.round(cps / 30))
    for (let i = step; i <= full.length + step; i += step) {
      this.patchFeed(id, full.slice(0, i))
      await wait(33)
    }
    this.patchFeed(id, full, true)
  }

  private logSession(line: string) {
    const t = new Date()
    const stamp = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}`
    this.state = { ...this.state, sessionLog: [`[${stamp}] ${line}`, ...this.state.sessionLog].slice(0, 60) }
  }

  setCore(core: CoreState) {
    if (this.state.core === core) return
    this.state = { ...this.state, core }
    this.touch()
  }

  navigate(screen: ScreenId) {
    if (this.state.screen !== screen) {
      this.state = { ...this.state, screen }
      this.touch()
      this.logSession(`viewport → ${screen.toUpperCase()}`)
    }
  }

  selectMemory(id: string | null) {
    this.state = { ...this.state, selectedMemory: id }
    this.touch()
  }

  /* ---- boot ---- */
  async initialize() {
    if (this.state.phase !== 'dormant') return
    const stages: BootStage[] = [
      { label: 'Waking power lattice', done: false },
      { label: 'Mounting neural substrate', done: false },
      { label: 'Re-indexing memory vault', done: false },
      { label: 'Calibrating sensor arrays', done: false },
      { label: 'Arming sentinel watch', done: false },
      { label: 'Binding operator identity', done: false },
      { label: 'Aligning personality matrix', done: false },
      { label: 'Igniting holographic core', done: false },
    ]
    this.state = { ...this.state, phase: 'booting', core: 'booting', bootStages: stages, bootProgress: 0 }
    this.touch()
    this.logSession('initialization requested by operator')

    for (let i = 0; i < stages.length; i++) {
      const target = ((i + 1) / stages.length) * 100
      const start = this.state.bootProgress
      const steps = 14
      for (let s = 1; s <= steps; s++) {
        this.state = { ...this.state, bootProgress: start + ((target - start) * s) / steps }
        this.touch()
        await wait(rnd(28, 70))
      }
      const bootStages = this.state.bootStages.map((st, j) => (j === i ? { ...st, done: true } : st))
      this.state = { ...this.state, bootStages }
      this.touch()
      await wait(rnd(60, 160))
    }
    await wait(500)
    this.state = { ...this.state, phase: 'online', core: 'idle' }
    this.touch()
    this.startLoops()
    this.logSession('core online · greeting streamed')
    const warm = this.state.settings.warmth
    const greet = [
      warm > 55
        ? 'Operator. Good to feel the current again — HERCULES is fully online.'
        : 'HERCULES online. All lattices hot, memory coherent, perimeter armed.',
      'Six subsystems report nominal. The neural core is idling at readiness and the holographic projector is stable.',
      'Issue a directive below, or open a voice link and simply speak.',
    ]
    await this.streamMessage('hercules', greet, 'SYSTEM HANDSHAKE', 110)
  }

  reboot() {
    this.timers.forEach((t) => window.clearInterval(t))
    this.timers = []
    this.stopHum()
    if (this.voiceTimer) window.clearTimeout(this.voiceTimer)
    this.state = {
      ...this.state,
      phase: 'dormant',
      core: 'offline',
      voiceActive: false,
      voiceLevel: 0,
      screen: 'command',
      bootProgress: 0,
      bootStages: [],
    }
    this.logSession('core power cycled by operator')
    this.touch()
  }

  /* ---- loops ---- */
  private startLoops() {
    this.timers.forEach((t) => window.clearInterval(t))
    this.timers = []

    const statsTick = window.setInterval(() => {
      if (this.state.phase !== 'online') return
      const busy = this.state.core === 'executing' || this.state.core === 'thinking'
      const modulePower = MODULES.filter((m) => this.state.settings.modules[m.id]).reduce((a, m) => a + m.power, 0)
      const intensity = this.state.settings.intensity
      const stats = this.state.stats.map((s) => {
        let target = s.value
        if (s.key === 'neural') target = 18 + modulePower * 0.55 + intensity * 0.18 + (busy ? 30 : 0)
        if (s.key === 'cpu') target = 30 + modulePower * 0.25 + (busy ? 34 : rnd(-6, 6))
        if (s.key === 'mem') target = 52 + (this.state.settings.modules.deepmem ? 8 : 0) + rnd(-4, 4)
        if (s.key === 'io') target = 1.6 + (busy ? 3.4 : 0) + rnd(0, 1.2)
        if (s.key === 'thermal') target = 34 + modulePower * 0.35 + (busy ? 12 : 0)
        if (s.key === 'mesh') target = this.state.settings.modules.overmesh ? rnd(38, 70) : rnd(14, 30)
        target = Math.min(s.max * 0.97, Math.max(1.5, target))
        const value = s.value + (target - s.value) * 0.22 + rnd(-1.4, 1.4)
        const history = [...s.history.slice(-47), value]
        return { ...s, value, history }
      })
      this.state = { ...this.state, stats, uptime: this.state.uptime + 1.4 }
      this.touch()
    }, 1400)

    const whisperTick = window.setInterval(() => {
      if (this.state.phase !== 'online') return
      if (Math.random() > this.state.settings.dominance / 135) return
      if (this.state.core === 'thinking' || this.state.core === 'executing') return
      this.pushFeed('process', pick(WHISPERS))
    }, 9000)

    this.timers.push(statsTick, whisperTick)
  }

  /* ---- command pipeline ---- */

  private resolveIntent(q: string): IntentDef {
    return INTENTS.find((i) => i.match.test(q)) ?? FALLBACK
  }

  async command(raw: string, via: 'text' | 'vox' = 'text') {
    const q = raw.trim()
    if (!q || this.state.core === 'thinking' || this.state.core === 'executing') return
    if (this.state.phase !== 'online') return

    this.pushFeed(via === 'vox' ? 'vox' : 'user', q)
    this.logSession(`directive received (${via}) · “${q.slice(0, 38)}”`)
    this.setCore('thinking')

    const { warmth: warm, dominance: dom } = this.state.settings
    const ack =
      dom > 70
        ? pick(DOMINANT_ACKS)
        : `${warm > 60 ? pick(WARM_PREFIX) + ' ' : warm < 30 ? pick(COLD_PREFIX) + ' ' : ''}${pick(GREETINGS)}`
    await wait(rnd(420, 760))
    await this.streamMessage('hercules', [ack], undefined, 160)

    const def = this.resolveIntent(q)
    await wait(rnd(500, 900))

    this.pushFeed('process', `intent resolved → ${def.intent} · confidence ${rnd(0.82, 0.98).toFixed(2)}`)

    const nSteps = def.steps.length
    const steps: TaskStep[] = def.steps.map((label, i) => ({
      id: uid(),
      label,
      detail: def.stepDetails[i] ?? `step.${i}()`,
      status: 'pending',
      duration: rnd(620, 1650),
    }))
    const task: HTask = {
      id: uid(),
      ref: `OP-${String(this.taskCounter++).padStart(3, '0')}`,
      title: def.title(q),
      intent: def.intent,
      query: q,
      createdAt: Date.now(),
      status: 'running',
      steps,
      progress: 0,
    }
    this.state = { ...this.state, tasks: [task, ...this.state.tasks] }
    this.touch()
    this.logSession(`task ${task.ref} spawned · ${nSteps} stages`)
    this.setCore('executing')

    for (let i = 0; i < steps.length; i++) {
      this.patchStep(task.id, i, 'active')
      await wait(steps[i].duration)
      this.patchStep(task.id, i, 'done')
      this.state = {
        ...this.state,
        tasks: this.state.tasks.map((t) => (t.id === task.id ? { ...t, progress: (i + 1) / nSteps } : t)),
      }
      this.touch()
    }

    const finished = this.state.tasks.find((t) => t.id === task.id)
    if (finished) {
      const doneTask: HTask = { ...finished, status: 'done', result: def.summary, progress: 1 }
      this.state = { ...this.state, tasks: this.state.tasks.map((t) => (t.id === task.id ? doneTask : t)) }
      this.touch()
    }
    this.logSession(`task ${task.ref} complete · ${def.summary}`)

    this.setCore('speaking')
    const report = def.report(q, this)
    const { precision, warmth } = this.state.settings
    if (precision >= 65) {
      report.push(
        `— confidence ${rnd(0.88, 0.99).toFixed(2)} · elapsed ${(report.length * rnd(0.7, 1.1)).toFixed(1)}s · all tolerances green`,
      )
    }
    if (warmth >= 60) {
      report.push(pick(WARM_CLOSERS))
    }
    await this.streamMessage('hercules', report, `${def.intent} · REPORT`, this.state.settings.intensity > 70 ? 150 : 90)

    this.addSessionMemory(def.intent, q)
    this.setCore('idle')
  }

  private patchStep(taskId: string, idx: number, status: TaskStep['status']) {
    this.state = {
      ...this.state,
      tasks: this.state.tasks.map((t) =>
        t.id === taskId ? { ...t, steps: t.steps.map((s, i) => (i === idx ? { ...s, status } : s)) } : t,
      ),
    }
    this.touch()
  }

  private addSessionMemory(intent: string, q: string) {
    const t = new Date()
    const label = `${intent.toLowerCase()} · ${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`
    const angle = rnd(0, Math.PI * 2)
    const radius = rnd(0.16, 0.3)
    const node: MemoryNode = {
      id: uid(),
      label,
      kind: 'session',
      weight: rnd(0.25, 0.45),
      x: 0.5 + Math.cos(angle) * radius,
      y: 0.5 + Math.sin(angle) * radius * 0.9,
      parent: 'dom-0',
      note: `crystallized from directive · “${q.slice(0, 60)}”`,
    }
    this.state = { ...this.state, memory: [...this.state.memory, node] }
    this.touch()
  }

  forceTask(kind: string) {
    const map: Record<string, string> = {
      scan: 'Run a deep diagnostic sweep',
      optimize: 'Optimize the throughput profile',
      secure: 'Harden the security perimeter',
      brief: 'Summarize the current situation',
    }
    void this.command(map[kind] ?? kind, 'text')
  }

  /* ---- voice ---- */

  beginVoiceLink(custom?: string) {
    if (this.state.voiceActive) return
    if (this.state.core === 'thinking' || this.state.core === 'executing') return
    if (this.state.phase !== 'online') return
    this.state = { ...this.state, voiceActive: true }
    this.setCore('listening')
    this.logSession('voice link opened · mic lattice hot')
    this.pushFeed('system', 'VOICE LINK ESTABLISHED · acoustic lattice forming')

    const iv = window.setInterval(() => {
      const lvl = 0.2 + Math.abs(Math.sin(Date.now() / 180)) * 0.45 + rnd(0, 0.35)
      this.state = { ...this.state, voiceLevel: Math.min(1, lvl) }
      this.touch()
    }, 70)
    this.timers.push(iv)

    this.voiceTimer = window.setTimeout(() => {
      window.clearInterval(iv)
      this.pushFeed('process', 'acoustic parse locked · intent decoded')
      const phrase = custom ?? pick(VOICE_DIRECTIVES)
      this.state = { ...this.state, voiceActive: false, voiceLevel: 0 }
      this.touch()
      void this.command(phrase, 'vox')
    }, 3600)
  }

  endVoiceLink() {
    if (!this.state.voiceActive) return
    if (this.voiceTimer) window.clearTimeout(this.voiceTimer)
    this.state = { ...this.state, voiceActive: false, voiceLevel: 0 }
    this.setCore('idle')
    this.pushFeed('system', 'voice link severed by operator')
    this.logSession('voice link manually severed')
    this.touch()
  }

  /* ---- settings ---- */

  updateSettings(patch: Partial<HercSettings>) {
    this.state = { ...this.state, settings: { ...this.state.settings, ...patch } }
    this.touch()
    if (patch.hue !== undefined) {
      document.documentElement.style.setProperty('--herc-hue', String(patch.hue))
    }
    if (patch.hum !== undefined) {
      if (patch.hum) this.startHum()
      else this.stopHum()
    }
    if (patch.intensity !== undefined) this.logSession(`projector drive → ${patch.intensity}`)
    if (patch.warmth !== undefined) this.logSession(`personality matrix · sentient warmth → ${patch.warmth}`)
    if (patch.dominance !== undefined) this.logSession(`personality matrix · strategic dominance → ${patch.dominance}`)
    if (patch.precision !== undefined) this.logSession(`personality matrix · calm precision → ${patch.precision}`)
    if (patch.intensity !== undefined || patch.warmth !== undefined || patch.dominance !== undefined || patch.precision !== undefined)
      this.touch()
  }

  toggleModule(id: string) {
    const modules = { ...this.state.settings.modules, [id]: !this.state.settings.modules[id] }
    this.state = { ...this.state, settings: { ...this.state.settings, modules } }
    const m = MODULES.find((x) => x.id === id)
    const on = modules[id]
    this.pushFeed('system', `${m?.name.toUpperCase()} ${on ? 'brought online' : 'safely spun down'}`)
    this.logSession(`module ${id} ${on ? 'ON' : 'OFF'}`)
    this.touch()
  }

  purgeVolatile() {
    const memory = this.state.memory.filter((m) => m.kind !== 'session')
    this.state = { ...this.state, memory, selectedMemory: null }
    this.pushFeed('system', 'volatile memory purged · session fragments dissolved · deep graph intact')
    this.logSession('volatile purge executed')
    this.touch()
  }

  /* ---- hum ---- */
  private startHum() {
    try {
      if (this.humCtx) return
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 52
      gain.gain.value = 0.028
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.frequency.value = 0.35
      lfoGain.gain.value = 0.012
      lfo.connect(lfoGain)
      lfoGain.connect(gain.gain)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      lfo.start()
      this.humCtx = ctx
      this.humNodes = { osc, gain }
    } catch {
      /* audio unavailable — visual hum only */
    }
  }
  private stopHum() {
    try {
      this.humNodes?.osc.stop()
      void this.humCtx?.close()
    } catch {
      /* noop */
    }
    this.humCtx = null
    this.humNodes = null
  }
}

export const herc = new HerculesCore()
