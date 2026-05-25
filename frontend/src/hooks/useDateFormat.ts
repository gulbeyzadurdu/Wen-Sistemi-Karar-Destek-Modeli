import { useCallback } from 'react'

import { formatDateTime, formatTime } from '@/lib/format-date'
import { useOpsStore } from '@/stores/ops-store'

/**
 * Returns formatting functions bound to the user's regional date/time setting.
 * Re-renders automatically when the user changes the format in Settings.
 */
export function useDateFormat() {
  const fmt = useOpsStore((s) => s.regional.dateTimeFormat)

  const fmtDateTime = useCallback(
    (date: Date) => formatDateTime(date, fmt),
    [fmt],
  )

  const fmtTime = useCallback(
    (date: Date) => formatTime(date, fmt),
    [fmt],
  )

  return { fmtDateTime, fmtTime, fmt }
}
