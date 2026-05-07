import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { CrisisLevelUI, NexusTier } from '@/types/wen'

export type CrisisLogEntry = {
  id: string
  tsIso: string
  message: string
  level: CrisisLevelUI
}

type CrisisState = {
  level: CrisisLevelUI
  /** Kod Kırmızı persists until `/crisis` resolve clears it */
  manualLock: boolean
  setLevel: (level: Exclude<CrisisLevelUI, 'none'>) => void
  escalateToRed: () => void
  startKodKirmizi: () => void
  startWaterCutoff: () => void
  notifyTeamAck: boolean
  setNotifyTeamAck: (v: boolean) => void
  resolveIncident: () => void
  resetSystem: () => void
  alarmMuted: boolean
  toggleAlarmMuted: () => void
  notificationLogs: CrisisLogEntry[]
  appendNotificationLog: (message: string) => void
  clearNotificationLogs: () => void
  auditLogs: CrisisLogEntry[]
  appendAuditLog: (message: string) => void
  /** Auto escalation from telemetry tier */
  hydrateFromTier: (tier: NexusTier) => void
}

function buildLog(level: CrisisLevelUI, message: string): CrisisLogEntry {
  return {
    id: crypto.randomUUID(),
    tsIso: new Date().toISOString(),
    level,
    message,
  }
}

export const useCrisisStore = create<CrisisState>()(
  persist(
    (set, get) => ({
      level: 'none',
      manualLock: false,
      notifyTeamAck: false,
      alarmMuted: true,
      notificationLogs: [],
      auditLogs: [],
      appendNotificationLog: (message) =>
        set((state) => ({
          notificationLogs: [...state.notificationLogs, buildLog(state.level, message)],
        })),
      clearNotificationLogs: () => set({ notificationLogs: [] }),
      appendAuditLog: (message) =>
        set((state) => ({
          auditLogs: [...state.auditLogs, buildLog(state.level, message)],
        })),
      toggleAlarmMuted: () => set((state) => ({ alarmMuted: !state.alarmMuted })),
      setNotifyTeamAck: (notifyTeamAck) => set({ notifyTeamAck }),
      setLevel: (next) =>
        set((state) => {
          if (state.manualLock && (state.level === 'red' || state.level === 'KOD_KIRMIZI' || state.level === 'WATER_CUTOFF')) return state
          return { ...state, level: next }
        }),
      escalateToRed: () =>
        set((state) => ({
          level: 'red',
          manualLock: true,
          auditLogs: [...state.auditLogs, buildLog('red', 'Kod Kırmızı manuel tetiklendi.')],
        })),
      startKodKirmizi: () =>
        set((state) => ({
          level: 'KOD_KIRMIZI',
          manualLock: true,
          auditLogs: [...state.auditLogs, buildLog('KOD_KIRMIZI', 'KOD KIRMIZI simülasyonu başlatıldı.')],
        })),
      startWaterCutoff: () =>
        set((state) => ({
          level: 'WATER_CUTOFF',
          manualLock: true,
          auditLogs: [...state.auditLogs, buildLog('WATER_CUTOFF', 'Acil Su Kesintisi simülasyonu başlatıldı.')],
        })),
      resolveIncident: () =>
        set((state) => ({
          level: 'none',
          manualLock: false,
          notifyTeamAck: false,
          auditLogs: [...state.auditLogs, buildLog('none', 'Olay çözüldü, sistem normale alındı.')],
        })),
      resetSystem: () =>
        set((state) => ({
          level: 'none',
          manualLock: false,
          notifyTeamAck: false,
          notificationLogs: [],
          auditLogs: [...state.auditLogs, buildLog('none', 'Reset System komutu çalıştırıldı.')],
        })),
      hydrateFromTier: (tier) => {
        const { manualLock, level } = get()
        if (manualLock && (level === 'red' || level === 'KOD_KIRMIZI' || level === 'WATER_CUTOFF')) return

        const nextLevel: CrisisLevelUI =
          tier === 'normal' ? 'none' : tier === 'warning' ? 'yellow' : tier === 'alert' ? 'orange' : 'orange'
        set({ level: nextLevel })
      },
    }),
    {
      name: 'wen-crisis',
      partialize: (state) => ({
        level: state.level,
        manualLock: state.manualLock,
        notifyTeamAck: state.notifyTeamAck,
        alarmMuted: state.alarmMuted,
        notificationLogs: state.notificationLogs,
        auditLogs: state.auditLogs,
      }),
    },
  ),
)
