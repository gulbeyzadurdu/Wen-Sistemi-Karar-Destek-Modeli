import { create } from 'zustand'

type AppState = {
  appTitle: string
  setAppTitle: (value: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  appTitle: 'WEN',
  setAppTitle: (appTitle) => set({ appTitle }),
}))
