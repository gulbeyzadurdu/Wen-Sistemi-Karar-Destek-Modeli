import { useEffect } from 'react'

import { useLiveTelemetry } from '@/hooks/useLiveTelemetry'
import { useNexusComputation } from '@/hooks/useNexus'
import { useCrisisStore } from '@/stores/crisis-store'

/** Telemetriden Nexus seviyesini krize bağlar ve kök tema verisini işler */
export function CrisisProvider({ children }: { children: React.ReactNode }) {
  const hydrateFromTier = useCrisisStore((s) => s.hydrateFromTier)
  const manualLockedRed = useCrisisStore((s) => s.manualLock && (s.level === 'red' || s.level === 'KOD_KIRMIZI' || s.level === 'WATER_CUTOFF'))

  const telemetry = useLiveTelemetry()
  const { tier } = useNexusComputation(
    telemetry.data?.energy_kwh,
    telemetry.data?.water_m3,
    manualLockedRed,
  )

  useEffect(() => {
    if (manualLockedRed) return
    if (!telemetry.data) return
    hydrateFromTier(tier)
  }, [manualLockedRed, hydrateFromTier, telemetry.data, tier])

  useEffect(() => {
    document.documentElement.dataset.nexusTier = tier
    return () => {
      delete document.documentElement.dataset.nexusTier
    }
  }, [tier])

  return children
}
