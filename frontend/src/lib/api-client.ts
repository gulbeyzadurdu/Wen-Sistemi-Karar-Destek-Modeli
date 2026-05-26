import type { UserRole } from '@/types/wen'

const BASE_URL = 'http://127.0.0.1:8000/v1'
const TOKEN_KEY = 'wen-token'

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/** Decode JWT payload without a third-party library (base64url → JSON). */
function decodePayload(token: string): Record<string, unknown> {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64)) as Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Core fetch wrapper — handles 401 globally
// ---------------------------------------------------------------------------

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, options)

  if (res.status === 401) {
    clearToken()
    throw new Error('Oturum süresi doldu, lütfen tekrar giriş yapın.')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { detail?: string }
    throw new Error(body.detail ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------

export type LoginResult = {
  sub: string
  role: UserRole
  name: string
}

/**
 * POST /auth/login — email + password ile token alır.
 * Token'ı localStorage'a `wen-token` key'iyle yazar.
 * Decode edip { sub, role, name } döner.
 */
export async function login(email: string, password: string): Promise<LoginResult> {
  const data = await request<{ access_token: string; token_type: string }>(
    '/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    },
  )

  localStorage.setItem(TOKEN_KEY, data.access_token)

  const payload = decodePayload(data.access_token)
  return {
    sub: payload.sub as string,
    role: payload.role as UserRole,
    name: payload.name as string,
  }
}

export type MeResponse = {
  id: string
  email: string
  role: UserRole
  name: string
  department: string | null
}

/**
 * GET /auth/me — localStorage'daki token ile oturum açık kullanıcıyı döner.
 */
export async function getMe(): Promise<MeResponse> {
  const token = getToken()
  return request<MeResponse>('/auth/me', {
    headers: { Authorization: `Bearer ${token ?? ''}` },
  })
}

// ---------------------------------------------------------------------------
// Telemetry endpoints
// ---------------------------------------------------------------------------

function authHeaders(): HeadersInit {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export type TelemetryPacket = {
  energy_kwh: number
  water_m3: number
  nexus_ratio: number
  ts: string
}

/** GET /telemetry/live — anlık tek paket. */
export async function getTelemetryLive(): Promise<TelemetryPacket> {
  return request<TelemetryPacket>('/telemetry/live', { headers: authHeaders() })
}

/** GET /telemetry/history?points=N — geriye doğru N dakikalık paket listesi. */
export async function getTelemetryHistory(points = 50): Promise<TelemetryPacket[]> {
  return request<TelemetryPacket[]>(`/telemetry/history?points=${points}`, {
    headers: authHeaders(),
  })
}

// ---------------------------------------------------------------------------
// Crisis endpoints
// ---------------------------------------------------------------------------

export type CrisisAuditPayload = {
  step_id: string
  timestamp: string
  user_id: string
}

/** PUT /crisis/audit — kriz protokol adımını audit tablosuna kaydeder. */
export async function putCrisisAudit(payload: CrisisAuditPayload): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>('/crisis/audit', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
}
