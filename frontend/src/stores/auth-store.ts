import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { UserRole } from '@/types/wen'

type AuthState = {
  token: string | null
  role: UserRole
  userId: string
  displayName: string
  login: (role: UserRole, displayName?: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: 'STRATEGIC',
      userId: 'guest',
      displayName: 'Misafir',
      login(role, displayName) {
        const uid = crypto.randomUUID()
        set({
          token: `mock-jwt.${uid}`,
          role,
          userId: uid,
          displayName: displayName ?? (role === 'STRATEGIC' ? 'Arif — Strateji' : 'Emre — Operasyon'),
        })
      },
      logout() {
        set({ token: null, userId: 'guest', displayName: 'Misafir' })
      },
    }),
    {
      name: 'wen-auth',
      partialize: (state) => ({
        token: state.token,
        role: state.role,
        userId: state.userId,
        displayName: state.displayName,
      }),
    },
  ),
)
