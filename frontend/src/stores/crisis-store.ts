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
  emergencySimulationActive: boolean
  setLevel: (level: Exclude<CrisisLevelUI, 'none'>) => void
  escalateToRed: () => void
  startKodKirmizi: () => void
  startWaterCutoff: () => void
  /** Müdahale simülasyonu: orange + manualLock — resetSystem ile durdurulur */
  startInterventionSimulation: (userId?: string) => void
  notifyTeamAck: boolean
  setNotifyTeamAck: (v: boolean) => void
  resolveIncident: () => void
  resetSystem: () => void
  alarmMuted: boolean
  toggleAlarmMuted: () => void
  notificationLogs: CrisisLogEntry[]
  dismissedNotificationIds: string[]
  appendNotificationLog: (message: string) => void
  dismissNotification: (id: string) => void
  clearNotificationLogs: () => void
  resetSessionState: () => void
  auditLogs: CrisisLogEntry[]
  appendAuditLog: (message: string) => void
  /** Auto escalation from telemetry tier — manualLock varsa hiç dokunmaz */
  hydrateFromTier: (tier: NexusTier) => void
}

export function selectUnreadNotifications(state: CrisisState): CrisisLogEntry[] {
  const dismissed = new Set(state.dismissedNotificationIds ?? [])
  return (state.notificationLogs ?? []).filter((log) => !dismissed.has(log.id))
}

export function selectUnreadNotificationCount(state: CrisisState): number {
  return selectUnreadNotifications(state).length
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
      emergencySimulationActive: false,
      notifyTeamAck: false,
      alarmMuted: true,
      notificationLogs: [],
      dismissedNotificationIds: [],
      auditLogs: [],
      appendNotificationLog: (message) =>
        set((state) => ({
          notificationLogs: [...state.notificationLogs, buildLog(state.level, message)],
        })),
      dismissNotification: (id) =>
        set((state) => {
          const dismissed = state.dismissedNotificationIds ?? []
          return {
            dismissedNotificationIds: dismissed.includes(id)
              ? dismissed
              : [...dismissed, id],
          }
        }),
      clearNotificationLogs: () => set({ notificationLogs: [], dismissedNotificationIds: [] }),
      resetSessionState: () =>
        set({
          level: 'none',
          manualLock: false,
          emergencySimulationActive: false,
          notifyTeamAck: false,
          notificationLogs: [],
          dismissedNotificationIds: [],
        }),
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
          emergencySimulationActive: true,
          auditLogs: [...state.auditLogs, buildLog('red', 'Kod Kırmızı manuel tetiklendi.')],
        })),
      startKodKirmizi: () =>
        set((state) => ({
          level: 'KOD_KIRMIZI',
          manualLock: true,
          emergencySimulationActive: true,
          auditLogs: [...state.auditLogs, buildLog('KOD_KIRMIZI', 'KOD KIRMIZI simülasyonu başlatıldı.')],
        })),
      startWaterCutoff: () =>
        set((state) => ({
          level: 'WATER_CUTOFF',
          manualLock: true,
          emergencySimulationActive: true,
          auditLogs: [...state.auditLogs, buildLog('WATER_CUTOFF', 'Acil Su Kesintisi simülasyonu başlatıldı.')],
        })),
      startInterventionSimulation: (userId = 'sistem') => {
        const now = new Date()
        const ts = [now.getHours(), now.getMinutes(), now.getSeconds()]
          .map((n) => String(n).padStart(2, '0'))
          .join(':')
        const msg = `Kriz müdahalesi başarıyla başlatıldı - ${ts}`
        set((state) => ({
          level: 'orange',
          manualLock: true,
          emergencySimulationActive: true,
          notificationLogs: [...state.notificationLogs, buildLog('orange', msg)],
          auditLogs: [...state.auditLogs, buildLog('orange', `[SİMÜLASYON] ${msg} · kullanıcı: ${userId}`)],
        }))
      },
      resolveIncident: () =>
        set((state) => ({
          level: 'none',
          manualLock: false,
          emergencySimulationActive: false,
          notifyTeamAck: false,
          auditLogs: [...state.auditLogs, buildLog('none', 'Olay çözüldü, sistem normale alındı.')],
        })),
      resetSystem: () =>
        set((state) => ({
          level: 'none',
          manualLock: false,
          emergencySimulationActive: false,
          notifyTeamAck: false,
          notificationLogs: [],
          dismissedNotificationIds: [],
          auditLogs: [...state.auditLogs, buildLog('none', 'Reset System komutu çalıştırıldı.')],
        })),
      hydrateFromTier: (tier) => {
        const { manualLock } = get()
        // manualLock aktifse (simülasyon, KOD_KIRMIZI, WATER_CUTOFF vb.) telemetri seviyeyi ezmez
        if (manualLock) return

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
        dismissedNotificationIds: state.dismissedNotificationIds,
        auditLogs: state.auditLogs,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<CrisisState> | undefined
        return {
          ...currentState,
          ...persisted,
          dismissedNotificationIds: persisted?.dismissedNotificationIds ?? [],
          notificationLogs: persisted?.notificationLogs ?? [],
          auditLogs: persisted?.auditLogs ?? [],
        }
      },
    },
  ),
)
