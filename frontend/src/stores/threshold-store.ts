import { create } from 'zustand'

import { FACTORIES } from '@/mocks/factories'

export type TelemetryThresholds = {
  energyMin: number
  energyMax: number
  waterMin: number
  waterMax: number
}

type ThresholdState = {
  valuesByFactory: Record<string, TelemetryThresholds>
  getValues: (factoryId: 'ALL' | string) => TelemetryThresholds
  setValuesForFactory: (factoryId: 'ALL' | string, values: TelemetryThresholds) => void
  resetFactoryValues: (factoryId: 'ALL' | string) => void
}

export const DEFAULT_THRESHOLDS: TelemetryThresholds = {
  energyMin: 8.4,
  energyMax: 18.25,
  waterMin: 8.08,
  waterMax: 12.92,
}

function createFactoryThreshold(factoryId: string): TelemetryThresholds {
  const factory = FACTORIES.find((item) => item.id === factoryId)
  if (!factory) return DEFAULT_THRESHOLDS

  return {
    energyMin: Number((factory.energyConsumption * 0.72).toFixed(2)),
    energyMax: Number((factory.energyConsumption * 1.18).toFixed(2)),
    waterMin: Number((factory.waterConsumption * 0.78).toFixed(2)),
    waterMax: Number((factory.waterConsumption * 1.2).toFixed(2)),
  }
}

const initialByFactory: Record<string, TelemetryThresholds> = FACTORIES.reduce(
  (acc, factory) => {
    acc[factory.id] = createFactoryThreshold(factory.id)
    return acc
  },
  { ALL: DEFAULT_THRESHOLDS } as Record<string, TelemetryThresholds>,
)

export const useThresholdStore = create<ThresholdState>((set, get) => ({
  valuesByFactory: initialByFactory,
  getValues: (factoryId) => {
    const key = factoryId === 'ALL' ? 'ALL' : factoryId
    return get().valuesByFactory[key] ?? DEFAULT_THRESHOLDS
  },
  setValuesForFactory: (factoryId, values) =>
    set((state) => {
      const key = factoryId === 'ALL' ? 'ALL' : factoryId
      return {
        valuesByFactory: {
          ...state.valuesByFactory,
          [key]: values,
        },
      }
    }),
  resetFactoryValues: (factoryId) =>
    set((state) => {
      const key = factoryId === 'ALL' ? 'ALL' : factoryId
      return {
        valuesByFactory: {
          ...state.valuesByFactory,
          [key]: key === 'ALL' ? DEFAULT_THRESHOLDS : createFactoryThreshold(key),
        },
      }
    }),
}))
