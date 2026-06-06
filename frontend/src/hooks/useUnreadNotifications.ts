import { useMemo } from 'react'

import type { CrisisLogEntry } from '@/stores/crisis-store'
import { useCrisisStore } from '@/stores/crisis-store'

/** Okunmamış bildirimler — useMemo ile türetilir; Zustand selector'da yeni dizi döndürülmez. */
export function useUnreadNotifications(): CrisisLogEntry[] {
  const notificationLogs = useCrisisStore((s) => s.notificationLogs)
  const dismissedNotificationIds = useCrisisStore((s) => s.dismissedNotificationIds ?? [])

  return useMemo(() => {
    const dismissed = new Set(dismissedNotificationIds)
    return notificationLogs.filter((log) => !dismissed.has(log.id))
  }, [notificationLogs, dismissedNotificationIds])
}
