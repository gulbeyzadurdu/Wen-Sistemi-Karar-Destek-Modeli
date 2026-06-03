import { useEffect, useRef } from 'react'

import { useLiveTelemetry } from '@/hooks/useLiveTelemetry'
import { useNexusComputation } from '@/hooks/useNexus'
import { useCrisisStore } from '@/stores/crisis-store'

/**
 * Kaç ardışık anormal paket geldikten sonra kriz seviyesi yükseltilsin.
 * 12 sn polling × 4 = ~48 saniye sürekli anormallik gerekir.
 */
const ESCALATION_CYCLES = 4

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

  // Ardışık anormal paket sayacı — anlık spike'ların kriz banner'ı tetiklemesini önler.
  const consecutiveAbnormal = useRef(0)

  useEffect(() => {
    if (manualLockedRed) return
    if (!telemetry.data) return

    if (tier === 'normal') {
      // Normale dönüşte sayacı ve kriz seviyesini hemen sıfırla.
      consecutiveAbnormal.current = 0
      hydrateFromTier('normal')
    } else {
      consecutiveAbnormal.current += 1
      // Yalnızca ESCALATION_CYCLES ardışık anormal paket gelirse yükselt.
      if (consecutiveAbnormal.current >= ESCALATION_CYCLES) {
        hydrateFromTier(tier)
      }
    }
  }, [manualLockedRed, hydrateFromTier, telemetry.data, tier])

  useEffect(() => {
    document.documentElement.dataset.nexusTier = tier
    return () => {
      delete document.documentElement.dataset.nexusTier
    }
  }, [tier])

  return children
}
