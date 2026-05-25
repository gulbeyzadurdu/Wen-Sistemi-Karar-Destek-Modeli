import type { DateTimeFormat } from '@/stores/ops-store'

/**
 * Formats a Date object according to the user's regional date/time format setting.
 *
 * 24H → DD.MM.YYYY — HH:mm
 * 12H → MM/DD/YYYY — hh:mm AM/PM
 */
export function formatDateTime(date: Date, fmt: DateTimeFormat): string {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')

  if (fmt === '12H') {
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const h12 = hours % 12 || 12
    return `${mm}/${dd}/${yyyy} — ${String(h12).padStart(2, '0')}:${minutes} ${ampm}`
  }

  return `${dd}.${mm}.${yyyy} — ${String(hours).padStart(2, '0')}:${minutes}`
}

/**
 * Formats only the time part of a Date.
 *
 * 24H → HH:mm:ss
 * 12H → hh:mm:ss AM/PM
 */
export function formatTime(date: Date, fmt: DateTimeFormat): string {
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  if (fmt === '12H') {
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const h12 = hours % 12 || 12
    return `${String(h12).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`
  }

  return `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`
}
