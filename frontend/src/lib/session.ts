const SESSION_START_KEY = 'wen-session-start'

export function setSessionStart(): void {
  localStorage.setItem(SESSION_START_KEY, String(Date.now()))
}

export function clearSessionStart(): void {
  localStorage.removeItem(SESSION_START_KEY)
}

export function getSessionStart(): number | null {
  const raw = localStorage.getItem(SESSION_START_KEY)
  if (!raw) return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}
