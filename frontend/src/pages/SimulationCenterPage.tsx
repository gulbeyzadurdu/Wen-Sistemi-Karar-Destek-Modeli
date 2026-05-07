import { DropletOff, Send, ShieldAlert, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FACTORIES } from '@/mocks/factories'
import { useCrisisStore } from '@/stores/crisis-store'
import { useOpsStore } from '@/stores/ops-store'

export function SimulationCenterPage() {
  const selectedFactoryId = useOpsStore((s) => s.selectedFactoryId)
  const scenario = useOpsStore((s) => s.scenario)
  const triggerScenario = useOpsStore((s) => s.triggerScenario)
  const clearScenario = useOpsStore((s) => s.clearScenario)
  const crisisLevel = useCrisisStore((s) => s.level)
  const startWaterCutoff = useCrisisStore((s) => s.startWaterCutoff)
  const startKodKirmizi = useCrisisStore((s) => s.startKodKirmizi)
  const resetSystem = useCrisisStore((s) => s.resetSystem)
  const appendNotificationLog = useCrisisStore((s) => s.appendNotificationLog)
  const clearNotificationLogs = useCrisisStore((s) => s.clearNotificationLogs)
  const notificationLogs = useCrisisStore((s) => s.notificationLogs)
  const alarmMuted = useCrisisStore((s) => s.alarmMuted)
  const toggleAlarmMuted = useCrisisStore((s) => s.toggleAlarmMuted)
  const simulationTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (simulationTimerRef.current != null) {
      window.clearTimeout(simulationTimerRef.current)
      simulationTimerRef.current = null
    }

    if (crisisLevel !== 'KOD_KIRMIZI' && crisisLevel !== 'WATER_CUTOFF') return
    clearNotificationLogs()

    const queue = [...FACTORIES]
    const pump = () => {
      const factory = queue.shift()
      if (!factory) return
      appendNotificationLog(`${factory.name} fabrikasına acil durum protokolü iletildi - Bekleniyor...`)
      simulationTimerRef.current = window.setTimeout(() => {
        appendNotificationLog(`${factory.name} fabrikası yanıtı: Onaylandı (Ack)`)
        simulationTimerRef.current = window.setTimeout(pump, 500)
      }, 500)
    }
    pump()

    return () => {
      if (simulationTimerRef.current != null) window.clearTimeout(simulationTimerRef.current)
    }
  }, [appendNotificationLog, clearNotificationLogs, crisisLevel])

  return (
    <div className="space-y-s6">
      <header className="space-y-s2">
        <p className="font-mono text-[11px] tracking-[0.35em] text-slate">/simulations</p>
        <h1 className="font-display text-4xl tracking-[0.12em]">Simülasyon Merkezi</h1>
        <p className="text-slate">Uyarı, kriz ve acil durum senaryolarını kontrollü şekilde tetikleyin.</p>
      </header>

      <section className="rounded-xl border border-border bg-card p-s5 shadow-card">
        <h2 className="font-mono text-sm tracking-[0.2em] text-slate">Uyarı Simülasyonu</h2>
        <div className="mt-s4 grid gap-s3 md:grid-cols-3">
          <Button
            variant={scenario === 'HIGH_WATER' ? 'destructive' : 'outline'}
            className="h-12 text-sm font-bold"
            onClick={() => triggerScenario('HIGH_WATER')}
          >
            Yüksek Su Tüketimi
          </Button>
          <Button
            variant={scenario === 'ENERGY_FLUCTUATION' ? 'destructive' : 'outline'}
            className="h-12 text-sm font-bold"
            onClick={() => triggerScenario('ENERGY_FLUCTUATION')}
          >
            Enerji Dalgalanması
          </Button>
          <Button variant="secondary" className="h-12 text-sm font-bold" onClick={clearScenario}>
            Simülasyonu Temizle
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-destructive/60 bg-red-soft/30 p-s5 shadow-[0_0_50px_rgba(239,68,68,0.5)]">
        <h2 className="font-mono text-sm tracking-[0.2em] text-destructive">Acil Durum Simülasyonları</h2>
        <div className="mt-s4 grid gap-s3 md:grid-cols-3">
          <Button
            type="button"
            variant="destructive"
            className="h-14 border border-destructive/80 text-base font-bold shadow-[0_0_24px_rgba(239,68,68,0.45)]"
            onClick={startWaterCutoff}
          >
            <DropletOff className="h-5 w-5" />
            Acil Durum: Su Kesintisi
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-14 border border-destructive/80 text-base font-bold shadow-[0_0_30px_rgba(239,68,68,0.55)]"
            onClick={startKodKirmizi}
          >
            <ShieldAlert className="h-5 w-5" />
            KOD KIRMIZI
          </Button>
          <Button type="button" variant="outline" className="h-14 text-base font-bold" onClick={resetSystem}>
            Sistemi Resetle
          </Button>
        </div>
      </section>

      {(crisisLevel === 'KOD_KIRMIZI' || crisisLevel === 'WATER_CUTOFF' || notificationLogs.length > 0) && (
        <section className="grid gap-s4 xl:grid-cols-[minmax(0,1fr),360px]">
          <div className={cn('rounded-xl border border-destructive/60 bg-red-soft p-s5 text-destructive shadow-[0_0_50px_rgba(239,68,68,0.5)]')}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">ACİL DURUM MODU AKTİF</h3>
              <button
                type="button"
                onClick={toggleAlarmMuted}
                className="inline-flex items-center gap-s2 rounded-md border border-destructive/60 bg-base px-s3 py-s2 text-xs"
              >
                {alarmMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                {alarmMuted ? 'Alarm Sessiz' : 'Alarm Açık'}
              </button>
            </div>
            <p className="mt-s2 text-sm">VERİLER BLOKE EDİLDİ / MANUEL KONTROL</p>
            <p className="mt-s1 text-xs text-destructive/80">Aktif seviye: {crisisLevel}</p>
          </div>
          <aside className="space-y-s3 rounded-xl border border-border bg-card p-s4 shadow-card">
            <h3 className="font-mono text-sm tracking-[0.2em] text-slate">Notification Log</h3>
            <div className="max-h-72 space-y-s2 overflow-auto">
              {notificationLogs.map((log) => (
                <article key={log.id} className="rounded-md border border-border bg-elevated/60 p-s3 text-xs">
                  <p className="inline-flex items-center gap-s2 text-foreground">
                    <Send className="h-3.5 w-3.5 text-energy" />
                    {log.message}
                  </p>
                  <p className="mt-1 text-slate">{new Date(log.tsIso).toLocaleTimeString('tr-TR')}</p>
                </article>
              ))}
            </div>
            <p className="text-[11px] text-slate">Seçili kapsam: {selectedFactoryId}</p>
          </aside>
        </section>
      )}
    </div>
  )
}
