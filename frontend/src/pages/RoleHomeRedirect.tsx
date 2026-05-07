import { Navigate } from 'react-router-dom'

import { useAuthStore } from '@/stores/auth-store'

export function RoleHomeRedirect() {
  const role = useAuthStore((s) => s.role)

  const target = role === 'STRATEGIC' ? '/dashboard-strategic' : '/dashboard-technical'

  return <Navigate to={target} replace />
}
