import { Outlet } from 'react-router-dom'

import { CrisisStrip } from '@/components/layout/CrisisStrip'
import { DataOfflineBanner } from '@/components/layout/DataOfflineBanner'
import { GlobalHeader } from '@/components/layout/GlobalHeader'
import { MobileNav } from '@/components/layout/MobileNav'
import { SideNav } from '@/components/layout/SideNav'
import { useConnectionStore } from '@/stores/connection-store'

export function AppShell() {
  const mqttConnected = useConnectionStore((s) => s.mqttConnected)
  const redisFallback = useConnectionStore((s) => s.redisFallbackActive)

  return (
    <div className="flex min-h-svh flex-col bg-base text-foreground">
      <GlobalHeader />
      <DataOfflineBanner mqttConnected={mqttConnected} redisFallbackActive={redisFallback} />
      <CrisisStrip />
      <div className="mx-auto flex w-full max-w-content flex-1 gap-s4 px-s4 py-s6">
        <div className="hidden w-64 shrink-0 lg:block">
          <SideNav />
        </div>
        <main className="flex-1 space-y-s6">
          <MobileNav />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
