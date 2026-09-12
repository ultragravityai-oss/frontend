import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { herc } from './engine'
import type { HercSnapshot } from './types'

const Ctx = createContext<HercSnapshot>(herc.state)

export function HerculesProvider({ children }: { children: ReactNode }) {
  const [snap, setSnap] = useState<HercSnapshot>(herc.state)
  useEffect(() => herc.subscribe(() => setSnap(herc.state)), [])
  return <Ctx.Provider value={snap}>{children}</Ctx.Provider>
}

export const useHerc = () => useContext(Ctx)
export { herc }
