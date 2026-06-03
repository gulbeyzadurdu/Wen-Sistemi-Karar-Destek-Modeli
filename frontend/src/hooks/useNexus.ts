import { useMemo } from 'react'

import type { NexusTier } from '@/types/wen'

export type NexusComputation = {
  ratio: number | null
  tier: NexusTier
}

/**
 * Nexus Engine: Rn = Et / Wt (Energy kWh · Water m³).
 * Bands follow `frontend/user flow.md` thresholds.
 */
export function computeNexus(energy_kwh?: number | null, water_m3?: number | null): NexusComputation {
  if (energy_kwh == null || water_m3 == null) {
    return { ratio: null, tier: 'normal' }
  }
  if (!(water_m3 > 0)) {
    return { ratio: null, tier: 'normal' }
  }
  const ratio = energy_kwh / water_m3
  if (!(Number.isFinite(ratio))) return { ratio: null, tier: 'warning' }

  if (ratio < 0.8) return { ratio, tier: 'warning' }
  if (ratio <= 1.2) return { ratio, tier: 'normal' }
  if (ratio <= 1.5) return { ratio, tier: 'warning' }
  return { ratio, tier: 'alert' }
}

export function applyCriticalOverride(comp: NexusComputation, forceCritical: boolean): NexusComputation {
  if (!forceCritical) return comp
  return { ratio: comp.ratio, tier: 'critical' }
}

export function useNexusComputation(
  energy_kwh?: number | null,
  water_m3?: number | null,
  forceCritical = false,
): NexusComputation {
  return useMemo(
    () => applyCriticalOverride(computeNexus(energy_kwh, water_m3), forceCritical),
    [energy_kwh, water_m3, forceCritical],
  )
}
