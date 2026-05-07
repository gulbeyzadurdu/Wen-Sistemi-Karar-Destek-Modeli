import { create } from 'zustand'

import type { CrisisLevelUI, NexusTier } from '@/types/wen'

type CrisisState = {
  level: CrisisLevelUI
  /** Kod Kırmızı persists until `/crisis` resolve clears it */
  manualLock: boolean
  setLevel: (level: Exclude<CrisisLevelUI, 'none'>) => void
  escalateToRed: () => void
  notifyTeamAck: boolean
  setNotifyTeamAck: (v: boolean) => void
  resolveIncident: () => void
  /** Auto escalation from telemetry tier */
  hydrateFromTier: (tier: NexusTier) => void
}

export const useCrisisStore = create<CrisisState>((set, get) => ({
  level: 'none',
  manualLock: false,
  notifyTeamAck: false,
  setNotifyTeamAck: (notifyTeamAck) => set({ notifyTeamAck }),
  setLevel: (next) =>
    set((state) => {
      if (state.manualLock && state.level === 'red') return state
      return { ...state, level: next }
    }),
  escalateToRed: () => set({ level: 'red', manualLock: true }),
  resolveIncident: () => set({ level: 'none', manualLock: false, notifyTeamAck: false }),
  hydrateFromTier: (tier) => {
    const { manualLock, level } = get()
    if (manualLock && level === 'red') return

    const nextLevel: CrisisLevelUI =
      tier === 'normal' ? 'none' : tier === 'warning' ? 'yellow' : tier === 'alert' ? 'orange' : 'orange'

    set({ level: nextLevel })
  },
}))
