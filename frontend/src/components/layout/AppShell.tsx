import { ShieldAlert, Volume2, VolumeX } from 'lucide-react'
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

import { ChatBot } from '@/components/chat/ChatBot'
import { CrisisStrip } from '@/components/layout/CrisisStrip'
import { DataOfflineBanner } from '@/components/layout/DataOfflineBanner'
import { GlobalHeader } from '@/components/layout/GlobalHeader'
import { MobileNav } from '@/components/layout/MobileNav'
import { SideNav } from '@/components/layout/SideNav'
import { startAlarmLoop } from '@/lib/alarm'
import { cn } from '@/lib/utils'
import { useConnectionStore } from '@/stores/connection-store'
import { useCrisisStore } from '@/stores/crisis-store'

export function AppShell() {
  const mqttConnected = useConnectionStore((s) => s.mqttConnected)
  const redisFallback = useConnectionStore((s) => s.redisFallbackActive)
  const level = useCrisisStore((s) => s.level)
  const alarmMuted = useCrisisStore((s) => s.alarmMuted)
  const toggleAlarmMuted = useCrisisStore((s) => s.toggleAlarmMuted)
  const isEmergency = level === 'KOD_KIRMIZI' || level === 'WATER_CUTOFF'

  // Acil durum aktifken ve ses açıkken sürekli alarm döngüsü çal.
  // alarmMuted veya isEmergency değiştiğinde döngü yeniden kurulur.
  useEffect(() => {
    if (!isEmergency || alarmMuted) return
    const stop = startAlarmLoop(0.08, 2200)
    return stop
  }, [isEmergency, alarmMuted])

  return (
    <div
      className={cn(
        'flex min-h-svh flex-col bg-base text-foreground',
        isEmergency ? 'border border-destructive/60 shadow-[0_0_50px_rgba(239,68,68,0.5)]' : '',
      )}
    >
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[#080c14]">
        <div className="absolute left-[20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[15%] h-[450px] w-[450px] rounded-full bg-violet-500/5 blur-[100px]" />
      </div>
      <GlobalHeader />
      <DataOfflineBanner mqttConnected={mqttConnected} redisFallbackActive={redisFallback} />
      <CrisisStrip />
      {isEmergency ? (
        <div className="fixed right-4 top-24 z-50 inline-flex items-center gap-s2 rounded-md border border-destructive/60 bg-red-soft px-s3 py-s2 text-xs text-destructive">
          <ShieldAlert className="h-4 w-4" />
          <button
            onClick={toggleAlarmMuted}
            className="rounded p-0.5 transition hover:bg-destructive/10"
            title={alarmMuted ? 'Sesi aç' : 'Sesi kapat'}
          >
            {alarmMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          Acil Alarm
        </div>
      ) : null}
      <div className="mx-auto flex w-full max-w-content flex-1 gap-s4 px-s4 py-s6">
        <div className="hidden w-64 shrink-0 lg:block">
          <SideNav />
        </div>
        <main className="flex-1 space-y-s6 page-enter-active">
          <MobileNav />
          <Outlet />
        </main>
      </div>
      <ChatBot />
    </div>
  )
}
