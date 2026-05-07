import { useQuery } from '@tanstack/react-query'

import { fetchLiveTelemetry, fetchSeriesSnapshots } from '@/lib/telemetry-mock'

const LIVE_KEY = ['wen', 'telemetry', 'live'] as const
const TECH_SERIES_KEY = ['wen', 'telemetry', 'series'] as const

export type LivePacketRow = { ts: string; energy: number; water: number }

/**
 * Tek paylaşımlı MQTT mock akışı. PRD iki farklı poll aralığı ister (30s vs 10s);
 * Tek simülatör tutarlı kalsın diye ara değerde ortak zamanlayıcı kullanılıyor.
 */
export function useLiveTelemetry() {
  return useQuery({
    queryKey: LIVE_KEY,
    queryFn: fetchLiveTelemetry,
    refetchInterval: 12_000,
  })
}

export function useTechnicalSeries() {
  return useQuery({
    queryKey: TECH_SERIES_KEY,
    queryFn: () => fetchSeriesSnapshots(140),
    refetchInterval: 12_000,
  })
}
