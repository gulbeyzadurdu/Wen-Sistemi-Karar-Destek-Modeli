import { useQuery } from '@tanstack/react-query'

import { fetchAnomalies } from '@/lib/telemetry-mock'

export function useAnomalies() {
  return useQuery({
    queryKey: ['wen', 'anomalies'],
    queryFn: fetchAnomalies,
    staleTime: 60_000,
  })
}
