import { create } from 'zustand'

export type AppTheme = 'dark'

type ThemeState = {
  theme: AppTheme
}

export const useThemeStore = create<ThemeState>()(() => ({
  theme: 'dark',
}))
