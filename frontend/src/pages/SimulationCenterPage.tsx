import { Activity, Droplets, DropletOff, Send, ShieldAlert, Volume2, VolumeX, Zap } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { useDateFormat } from '@/hooks/useDateFormat'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FACTORIES } from '@/mocks/factories'
import { useCrisisStore } from '@/stores/crisis-store'
import { useOpsStore } from '@/stores/ops-store'

// Warning scenario metadata
const SCENARIO_META = {
  HIGH_WATER: {
    label: 'Yüksek Su Tüketimi',
    icon: Droplets,
    color: '#00d4ff',
    softBg: 'rgba(0,212,255,0.08)',
    border: 'rgba(0,212,255,0.3)',
    notifPrefix: 'Su tüketimi kritik eşiği aştı',
    details: [
      'BOSB geneli su akışı nominal değerin %22 üstünde',
      'Tekstil-A sektörü ana hat basıncı yüksek',
      'Su dengeleme sistemleri tetiklendi',
    ],
    auditTag: '[UYARI-SU]',
  },
  ENERGY_FLUCTUATION: {
    label: 'Enerji Dalgalanması',
    icon: Zap,
    color: '#ffd166',
    softBg: 'rgba(255,209,102,0.08)',
    border: 'rgba(255,209,102,0.3)',
    notifPrefix: 'Enerji dalgalanması tespit edildi',
    details: [
      'Otomotiv-B sektörü anlık yük %18 sapma gösterdi',
      'Kimya-D frekans dengesizliği gözlemlendi',
      'Yük dengeleme algoritmasi devreye alındı',
    ],
    auditTag: '[UYARI-ENERJİ]',
  },
} as const

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
  const appendAuditLog = useCrisisStore((s) => s.appendAuditLog)
  const clearNotificationLogs = useCrisisStore((s) => s.clearNotificationLogs)
  const notificationLogs = useCrisisStore((s) => s.notificationLogs)
  const alarmMuted = useCrisisStore((s) => s.alarmMuted)
  const toggleAlarmMuted = useCrisisStore((s) => s.toggleAlarmMuted)
  const { fmtTime } = useDateFormat()
  const simulationTimerRef = useRef<number | null>(null)
  const warningTimerRef = useRef<number | null>(null)
  const prevCrisisLevelRef = useRef(crisisLevel)

  // ── Warning scenario trigger (HIGH_WATER / ENERGY_FLUCTUATION) ──────────
  const handleTriggerWarning = (type: 'HIGH_WATER' | 'ENERGY_FLUCTUATION') => {
    const meta = SCENARIO_META[type]
    const ts = fmtTime(new Date())

    // Switch scenario (affects TechnicalDashboard data live)
    triggerScenario(type)

    // Play a soft alert cue
    new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav').play().catch(() => {})

    // Push to global notification log (appears in header badge)
    appendNotificationLog(`${meta.notifPrefix} — ${ts}`)

    // Push staggered detail notifications for realism
    if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current)
    meta.details.forEach((detail, i) => {
      warningTimerRef.current = window.setTimeout(() => {
        appendNotificationLog(`${meta.auditTag} ${detail}`)
      }, (i + 1) * 800)
    })

    // Audit trail
    appendAuditLog(`${meta.auditTag} Uyarı simülasyonu başlatıldı — kullanıcı eylemi · ${ts}`)
  }

  const handleClearWarning = () => {
    clearScenario()
    if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current)
    appendAuditLog('[UYARI-TEMİZLE] Uyarı simülasyonu sonlandırıldı.')
  }

  // ── Acil durum notification pump ────────────────────────────────────────
  useEffect(() => {
    const prevLevel = prevCrisisLevelRef.current
    prevCrisisLevelRef.current = crisisLevel

    if (simulationTimerRef.current != null) {
      window.clearTimeout(simulationTimerRef.current)
      simulationTimerRef.current = null
    }

    if (crisisLevel !== 'KOD_KIRMIZI' && crisisLevel !== 'WATER_CUTOFF') return

    const enteredEmergency =
      prevLevel !== 'KOD_KIRMIZI' &&
      prevLevel !== 'WATER_CUTOFF' &&
      (crisisLevel === 'KOD_KIRMIZI' || crisisLevel === 'WATER_CUTOFF')

    if (!enteredEmergency) return

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

  useEffect(() => {
    return () => {
      if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current)
    }
  }, [])

  const activeWarningMeta = scenario !== 'NONE'
    ? SCENARIO_META[scenario as keyof typeof SCENARIO_META]
    : null

  return (
    <div className="space-y-s6 page-enter-active">
      <header className="space-y-s2">
        <p className="font-mono text-[11px] tracking-[0.35em] text-slate">/simulasyonlar</p>
        <h1 className="font-display text-4xl tracking-[0.12em]">Simülasyon Merkezi</h1>
        <p className="text-slate">Uyarı, kriz ve acil durum senaryolarını kontrollü şekilde tetikleyin.</p>
      </header>

      {/* ── Uyarı simülasyonları ── */}
      <section className="glass-card p-s5 space-y-s4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-mono text-sm tracking-[0.2em] text-slate">Uyarı Simülasyonu</h2>
            <p className="mt-1 text-xs text-slate">Seçilen senaryo operasyon panelindeki sensör verilerini ve anomali beslemesini gerçek zamanlı etkiler.</p>
          </div>
          {scenario !== 'NONE' && (
            <span className="flex items-center gap-2 rounded-full border border-[rgba(255,209,102,0.3)] bg-[rgba(255,209,102,0.08)] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[#ffd166]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ffd166]" />
              Aktif
            </span>
          )}
        </div>

        <div className="grid gap-s3 md:grid-cols-3">
          {/* HIGH_WATER */}
          <button
            type="button"
            onClick={() => handleTriggerWarning('HIGH_WATER')}
            className={cn(
              'relative flex h-20 flex-col items-start justify-between overflow-hidden rounded-xl border p-4 text-left transition-all duration-200',
              scenario === 'HIGH_WATER'
                ? 'border-[rgba(0,212,255,0.4)] bg-[rgba(0,212,255,0.1)] shadow-[0_0_24px_rgba(0,212,255,0.2)]'
                : 'border-white/10 bg-white/[0.03] hover:border-[rgba(0,212,255,0.25)] hover:bg-[rgba(0,212,255,0.05)]',
            )}
          >
            <div className="flex w-full items-center justify-between">
              <Droplets className={cn('h-4 w-4', scenario === 'HIGH_WATER' ? 'text-[#00d4ff]' : 'text-slate')} />
              {scenario === 'HIGH_WATER' && (
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#00d4ff]">● Çalışıyor</span>
              )}
            </div>
            <span className={cn('text-sm font-semibold', scenario === 'HIGH_WATER' ? 'text-[#00d4ff]' : 'text-white')}>
              Yüksek Su Tüketimi
            </span>
          </button>

          {/* ENERGY_FLUCTUATION */}
          <button
            type="button"
            onClick={() => handleTriggerWarning('ENERGY_FLUCTUATION')}
            className={cn(
              'relative flex h-20 flex-col items-start justify-between overflow-hidden rounded-xl border p-4 text-left transition-all duration-200',
              scenario === 'ENERGY_FLUCTUATION'
                ? 'border-[rgba(255,209,102,0.4)] bg-[rgba(255,209,102,0.1)] shadow-[0_0_24px_rgba(255,209,102,0.2)]'
                : 'border-white/10 bg-white/[0.03] hover:border-[rgba(255,209,102,0.25)] hover:bg-[rgba(255,209,102,0.05)]',
            )}
          >
            <div className="flex w-full items-center justify-between">
              <Zap className={cn('h-4 w-4', scenario === 'ENERGY_FLUCTUATION' ? 'text-[#ffd166]' : 'text-slate')} />
              {scenario === 'ENERGY_FLUCTUATION' && (
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#ffd166]">● Çalışıyor</span>
              )}
            </div>
            <span className={cn('text-sm font-semibold', scenario === 'ENERGY_FLUCTUATION' ? 'text-[#ffd166]' : 'text-white')}>
              Enerji Dalgalanması
            </span>
          </button>

          {/* Clear */}
          <button
            type="button"
            onClick={handleClearWarning}
            disabled={scenario === 'NONE'}
            className="flex h-20 flex-col items-start justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Activity className="h-4 w-4 text-slate" />
            <span className="text-sm font-semibold text-white">Uyarıyı Temizle</span>
          </button>
        </div>
      </section>

      {/* ── Aktif uyarı durumu paneli ── */}
      {activeWarningMeta && (
        <section
          className="glass-card overflow-hidden p-s5"
          style={{ borderColor: activeWarningMeta.border, boxShadow: `0 0 32px ${activeWarningMeta.softBg}` }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: activeWarningMeta.color }}>
                Uyarı Senaryosu Aktif
              </p>
              <p className="text-lg font-semibold text-white">{activeWarningMeta.label}</p>
            </div>
            <span
              className="flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest"
              style={{ color: activeWarningMeta.color, borderColor: activeWarningMeta.border, background: activeWarningMeta.softBg }}
            >
              <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: activeWarningMeta.color }} />
              Gerçek Zamanlı İzleniyor
            </span>
          </div>
          <ul className="mt-4 space-y-2">
            {activeWarningMeta.details.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[#94a3b8]">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: activeWarningMeta.color }} />
                {d}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Acil Durum Simülasyonları ── */}
      <section className="rounded-xl border border-destructive/60 bg-red-soft/30 p-s5 shadow-[0_0_50px_rgba(239,68,68,0.5)]">
        <h2 className="font-mono text-sm tracking-[0.2em] text-destructive">Acil Durum Simülasyonları</h2>
        <div className="mt-s4 grid gap-s3 md:grid-cols-3">
          <Button
            type="button"
            variant="destructive"
            className="h-14 border border-destructive/80 text-base font-semibold shadow-[0_0_24px_rgba(239,68,68,0.45)]"
            onClick={startWaterCutoff}
          >
            <DropletOff className="h-5 w-5" />
            Acil Durum: Su Kesintisi
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-14 border border-destructive/80 text-base font-semibold shadow-[0_0_30px_rgba(239,68,68,0.55)]"
            onClick={startKodKirmizi}
          >
            <ShieldAlert className="h-5 w-5" />
            KOD KIRMIZI
          </Button>
          <Button type="button" variant="outline" className="h-14 text-base font-semibold" onClick={resetSystem}>
            Sistemi Resetle
          </Button>
        </div>
      </section>

      {/* ── Notification log (uyarı + acil durum) ── */}
      {(crisisLevel === 'KOD_KIRMIZI' || crisisLevel === 'WATER_CUTOFF' || notificationLogs.length > 0) && (
        <section className="grid gap-s4 xl:grid-cols-[minmax(0,1fr),360px]">
          {(crisisLevel === 'KOD_KIRMIZI' || crisisLevel === 'WATER_CUTOFF') && (
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
          )}
          <aside className={cn(
            'space-y-s3 rounded-xl border border-border bg-card p-s4 shadow-card',
            crisisLevel !== 'KOD_KIRMIZI' && crisisLevel !== 'WATER_CUTOFF' && 'xl:col-span-2',
          )}>
            <h3 className="font-mono text-sm tracking-[0.2em] text-slate">Bildirim Kaydı</h3>
            <div className="max-h-72 space-y-s2 overflow-auto">
              {notificationLogs.map((log) => (
                <article key={log.id} className="rounded-md border border-border bg-elevated/60 p-s3 text-xs">
                  <p className="inline-flex items-center gap-s2 text-foreground">
                    <Send className="h-3.5 w-3.5 text-energy" />
                    {log.message}
                  </p>
                  <p className="mt-1 text-slate">{fmtTime(new Date(log.tsIso))}</p>
                </article>
              ))}
            </div>
            <p className="text-[11px] text-slate">Kapsam: {selectedFactoryId}</p>
          </aside>
        </section>
      )}
    </div>
  )
}
