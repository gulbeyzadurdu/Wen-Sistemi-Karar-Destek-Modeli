import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AlertScenario = 'NONE' | 'HIGH_WATER' | 'ENERGY_FLUCTUATION'
export type Language = 'TR' | 'EN'
export type DateTimeFormat = '24H' | '12H'
export type TemperatureUnit = 'C' | 'F'

type NotificationSettings = {
  emailReports: boolean
  smsCritical: boolean
  weeklySavings: boolean
  maintenanceReminders: boolean
}

type RegionalSettings = {
  language: Language
  dateTimeFormat: DateTimeFormat
  temperatureUnit: TemperatureUnit
}

type OpsState = {
  selectedFactoryId: 'ALL' | string
  setSelectedFactoryId: (value: 'ALL' | string) => void

  scenario: AlertScenario
  triggerScenario: (scenario: AlertScenario) => void
  clearScenario: () => void

  notifications: NotificationSettings
  setNotification: <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => void

  regional: RegionalSettings
  setRegional: <K extends keyof RegionalSettings>(key: K, value: RegionalSettings[K]) => void
}

export const useOpsStore = create<OpsState>()(
  persist(
    (set) => ({
      selectedFactoryId: 'ALL',
      setSelectedFactoryId: (selectedFactoryId) => set({ selectedFactoryId }),

      scenario: 'NONE',
      triggerScenario: (scenario) => set({ scenario }),
      clearScenario: () => set({ scenario: 'NONE' }),

      notifications: {
        emailReports: true,
        smsCritical: true,
        weeklySavings: true,
        maintenanceReminders: false,
      },
      setNotification: (key, value) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [key]: value,
          },
        })),

      regional: {
        language: 'TR',
        dateTimeFormat: '24H',
        temperatureUnit: 'C',
      },
      setRegional: (key, value) =>
        set((state) => ({
          regional: {
            ...state.regional,
            [key]: value,
          },
        })),
    }),
    {
      name: 'wen-ops-store',
      partialize: (state) => ({
        selectedFactoryId: state.selectedFactoryId,
        scenario: state.scenario,
        notifications: state.notifications,
        regional: state.regional,
      }),
    },
  ),
)
