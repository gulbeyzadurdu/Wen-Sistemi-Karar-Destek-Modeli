import { create } from 'zustand'

export type TelemetryThresholds = {
  energyMin: number
  energyMax: number
  waterMin: number
  waterMax: number
}

type ThresholdState = {
  values: TelemetryThresholds
  setValues: (values: TelemetryThresholds) => void
}

export const DEFAULT_THRESHOLDS: TelemetryThresholds = {
  energyMin: 8.4,
  energyMax: 18.25,
  waterMin: 8.08,
  waterMax: 12.92,
}

export const useThresholdStore = create<ThresholdState>((set) => ({
  values: DEFAULT_THRESHOLDS,
  setValues: (values) => set({ values }),
}))
