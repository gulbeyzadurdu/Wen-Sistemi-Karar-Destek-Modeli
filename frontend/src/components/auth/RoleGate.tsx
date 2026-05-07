import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuthStore } from '@/stores/auth-store'
import type { UserRole } from '@/types/wen'

type Props = {
  allow: UserRole | UserRole[]
  children: ReactNode
}

export function RoleGate({ allow, children }: Props) {
  const role = useAuthStore((s) => s.user?.role ?? 'STRATEGIC')
  const accepted = Array.isArray(allow) ? allow : [allow]

  if (!accepted.includes(role)) {
    const fallback = role === 'STRATEGIC' ? '/dashboard-strategic' : '/dashboard-technical'
    return <Navigate to={fallback} replace />
  }

  return <>{children}</>
}
