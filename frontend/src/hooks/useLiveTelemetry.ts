import { useQuery } from '@tanstack/react-query'

import { getTelemetryHistory, getTelemetryLive } from '@/lib/api-client'
import { fetchLiveTelemetry, fetchSeriesSnapshots } from '@/lib/telemetry-mock'
import type { ChartRow, LiveTelemetry } from '@/lib/telemetry-mock'

const LIVE_KEY = ['wen', 'telemetry', 'live'] as const
const TECH_SERIES_KEY = ['wen', 'telemetry', 'series'] as const

export type LivePacketRow = { ts: string; energy: number; water: number }

/**
 * Canlı telemetri paketi.
 * Önce backend /telemetry/live endpoint'ini dener;
 * bağlantı veya auth hatası durumunda telemetry-mock'a fallback yapar.
 */
async function queryLive(): Promise<LiveTelemetry> {
  try {
    return await getTelemetryLive()
  } catch {
    return fetchLiveTelemetry()
  }
}

/**
 * Geçmiş telemetri serisi (140 nokta).
 * Önce backend /telemetry/history?points=140 endpoint'ini dener;
 * hata durumunda fetchSeriesSnapshots(140)'a fallback yapar.
 */
async function querySeries(): Promise<ChartRow[]> {
  try {
    const packets = await getTelemetryHistory(140)
    return packets.map((p) => ({
      t: new Date(p.ts).toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      energy: p.energy_kwh,
      water: p.water_m3,
    }))
  } catch {
    return fetchSeriesSnapshots(140)
  }
}

/**
 * Tek paylaşımlı canlı akış. PRD iki farklı poll aralığı ister (30s vs 10s);
 * ortak zamanlayıcı tutarlılığı sağlar.
 */
export function useLiveTelemetry() {
  return useQuery({
    queryKey: LIVE_KEY,
    queryFn: queryLive,
    refetchInterval: 12_000,
  })
}

export function useTechnicalSeries() {
  return useQuery({
    queryKey: TECH_SERIES_KEY,
    queryFn: querySeries,
    refetchInterval: 12_000,
  })
}
