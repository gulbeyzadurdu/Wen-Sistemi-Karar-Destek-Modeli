import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { UserRole } from '@/types/wen'

type AuthUser = {
  id: string
  name: string
  role: UserRole
}

type AuthState = {
  user: AuthUser | null
  isAuthenticated: boolean
  sessionStartedAt: number | null
  login: (role: UserRole, name?: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      sessionStartedAt: null,
      login(role, name) {
        set({
          user: {
            id: crypto.randomUUID(),
            role,
            name: name ?? (role === 'STRATEGIC' ? 'Arif Bey' : 'Emre Bey'),
          },
          isAuthenticated: true,
          sessionStartedAt: Date.now(),
        })
      },
      logout() {
        set({ user: null, isAuthenticated: false, sessionStartedAt: null })
      },
    }),
    {
      name: 'wen-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sessionStartedAt: state.sessionStartedAt,
      }),
    },
  ),
)
