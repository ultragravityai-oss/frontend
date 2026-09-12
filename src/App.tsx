import { AnimatePresence, motion } from 'framer-motion'
import Backdrop from './components/shell/Backdrop'
import NavRail from './components/shell/NavRail'
import TopBar from './components/shell/TopBar'
import BootScreen from './screens/BootScreen'
import CommandCenter from './screens/CommandCenter'
import CoreChamber from './screens/CoreChamber'
import ExecutionDeck from './screens/ExecutionDeck'
import MemoryVault from './screens/MemoryVault'
import NeuralGrid from './screens/NeuralGrid'
import VoiceLink from './screens/VoiceLink'
import { HerculesProvider, useHerc } from './lib/hercules/store'

const SCREENS = {
  command: CommandCenter,
  execution: ExecutionDeck,
  neural: NeuralGrid,
  memory: MemoryVault,
  voice: VoiceLink,
  core: CoreChamber,
} as const

function Shell() {
  const { phase, screen } = useHerc()

  if (phase !== 'online') {
    return (
      <div className="relative h-full">
        <Backdrop />
        <BootScreen />
      </div>
    )
  }

  const Active = SCREENS[screen]

  return (
    <div className="relative flex h-full flex-col overflow-hidden scanlines vignette">
      <Backdrop />
      <TopBar />
      <div className="relative z-10 flex min-h-0 flex-1">
        <NavRail />
        <main className="relative min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              className="absolute inset-0"
              initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <Active />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <HerculesProvider>
      <Shell />
    </HerculesProvider>
  )
}
