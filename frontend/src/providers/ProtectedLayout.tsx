import { AppShell } from '@/components/layout/AppShell'

import { CrisisProvider } from '@/providers/CrisisProvider'

export function ProtectedLayout() {
  return (
    <CrisisProvider>
      <AppShell />
    </CrisisProvider>
  )
}
