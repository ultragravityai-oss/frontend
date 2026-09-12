export type CoreState =
  | 'offline'
  | 'booting'
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'executing'
  | 'speaking'

export type Phase = 'dormant' | 'booting' | 'online'

export type ScreenId = 'command' | 'execution' | 'neural' | 'memory' | 'voice' | 'core'

export type FeedKind = 'user' | 'hercules' | 'system' | 'process' | 'vox'

export interface FeedItem {
  id: string
  ts: number
  kind: FeedKind
  title?: string
  text: string
  streaming?: boolean
}

export type StepStatus = 'pending' | 'active' | 'done'

export interface TaskStep {
  id: string
  label: string
  detail: string
  status: StepStatus
  duration: number // ms the mock execution takes
}

export type TaskStatus = 'running' | 'done'

export interface HTask {
  id: string
  ref: string
  title: string
  intent: string
  query: string
  createdAt: number
  status: TaskStatus
  steps: TaskStep[]
  progress: number // 0..1
  result?: string
}

export interface SysStat {
  key: string
  label: string
  unit: string
  value: number
  max: number
  accent?: boolean
  history: number[]
}

export interface MemoryNode {
  id: string
  label: string
  kind: 'domain' | 'entity' | 'session'
  weight: number // 0..1 node size
  x: number // 0..1 normalized layout
  y: number
  parent?: string
  note: string
}

export interface ModuleDef {
  id: string
  name: string
  desc: string
  power: number // % impact on neural load
}

export interface HercSettings {
  dominance: number // Dominant Strategic
  precision: number // Calm Precise
  warmth: number // Warm Sentient
  intensity: number // projector drive
  hue: number
  hum: boolean
  modules: Record<string, boolean>
}

export interface BootStage {
  label: string
  done: boolean
}

export interface HercSnapshot {
  phase: Phase
  core: CoreState
  screen: ScreenId
  feed: FeedItem[]
  tasks: HTask[]
  stats: SysStat[]
  memory: MemoryNode[]
  settings: HercSettings
  bootProgress: number
  bootStages: BootStage[]
  voiceLevel: number
  voiceActive: boolean
  uptime: number
  sessionLog: string[]
  selectedMemory: string | null
}
