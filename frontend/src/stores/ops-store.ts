import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AlertScenario = 'NONE' | 'HIGH_WATER' | 'ENERGY_FLUCTUATION'
export type DateTimeFormat = '24H' | '12H'
export type TemperatureUnit = 'C' | 'F'

type NotificationSettings = {
  emailReports: boolean
  smsCritical: boolean
  weeklySavings: boolean
  maintenanceReminders: boolean
}

type RegionalSettings = {
  dateTimeFormat: DateTimeFormat
  temperatureUnit: TemperatureUnit
}

type OpsState = {
  selectedFactoryId: 'ALL' | string
  setSelectedFactoryId: (value: 'ALL' | string) => void

  scenario: AlertScenario
  warningSimulationActive: boolean
  triggerScenario: (scenario: AlertScenario) => void
  clearScenario: () => void
  resetSessionState: () => void

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
      warningSimulationActive: false,
      triggerScenario: (scenario) =>
        set({ scenario, warningSimulationActive: scenario !== 'NONE' }),
      clearScenario: () => set({ scenario: 'NONE', warningSimulationActive: false }),
      resetSessionState: () => set({ scenario: 'NONE', warningSimulationActive: false }),

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
