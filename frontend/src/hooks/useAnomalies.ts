import { useQuery } from '@tanstack/react-query'

import { fetchAnomalies } from '@/lib/telemetry-mock'

export function useAnomalies(factoryId: 'ALL' | string = 'ALL') {
  return useQuery({
    queryKey: ['wen', 'anomalies', factoryId],
    queryFn: () => fetchAnomalies(factoryId),
    staleTime: 60_000,
  })
}
