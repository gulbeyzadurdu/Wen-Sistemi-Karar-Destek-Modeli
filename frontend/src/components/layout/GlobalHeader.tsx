import { Bell, LogOut, Radar, Settings, UserRound, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useLiveTelemetry } from '@/hooks/useLiveTelemetry'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCrisisStore, type CrisisLogEntry } from '@/stores/crisis-store'
import { useAuthStore } from '@/stores/auth-store'
import { useConnectionStore } from '@/stores/connection-store'
import { WeatherWidget } from '@/components/layout/WeatherWidget'

function StatusDot({
  variant,
  label,
}: {
  variant: 'ok' | 'warn' | 'alert' | 'danger' | 'neutral'
  label: string
}) {
  const color =
    variant === 'ok'
      ? 'bg-ok shadow-[0_0_14px_var(--ok)]'
      : variant === 'warn'
        ? 'bg-warn shadow-[0_0_12px_var(--warn)]'
        : variant === 'alert'
          ? 'bg-energy shadow-[0_0_12px_var(--energy)]'
          : variant === 'danger'
            ? 'bg-destructive shadow-[0_0_14px_var(--destructive)]'
            : 'bg-slate opacity-75'

  return (
    <span className="inline-flex items-center gap-s2 rounded-pill bg-elevated px-s3 py-s1 font-mono text-[11px] uppercase tracking-[0.3em] text-slate">
      <span className={cn('h-s2 w-s2 rounded-full', color)} aria-hidden />
      <span>{label}</span>
    </span>
  )
}

export function GlobalHeader({ className }: { className?: string }) {
  const displayName = useAuthStore((s) => s.user?.name ?? 'Misafir')
  const logout = useAuthStore((s) => s.logout)

  const mqttConnected = useConnectionStore((s) => s.mqttConnected)
  const redisFallback = useConnectionStore((s) => s.redisFallbackActive)

  const telemetry = useLiveTelemetry()

  const lockedRed = useCrisisStore(
    (s) => s.manualLock && (s.level === 'red' || s.level === 'KOD_KIRMIZI' || s.level === 'WATER_CUTOFF'),
  )
  const crisisLogs = useCrisisStore((s) => s.notificationLogs)
  // Debounced kriz seviyesi — CrisisProvider'daki 4-paket eşiğinden geçmiş değer
  const crisisLevel = useCrisisStore((s) => s.level)

  // Header tier'ı ham telemetriden değil, debounce edilmiş crisisStore'dan türetilir.
  const tier: ReturnType<typeof useNexusComputation>['tier'] =
    crisisLevel === 'none' ? 'normal'
    : crisisLevel === 'yellow' ? 'warning'
    : crisisLevel === 'orange' ? 'alert'
    : 'critical'

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<CrisisLogEntry[]>(crisisLogs)
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setNotifications(crisisLogs)
  }, [crisisLogs])

  // Dropdown dışına tıklanınca kapat
  useEffect(() => {
    if (!isProfileOpen) return
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
        setIsNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isProfileOpen])

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const closeProfile = () => {
    setIsProfileOpen(false)
    setIsNotifOpen(false)
  }

  let healthVariant: Parameters<typeof StatusDot>[0]['variant'] = 'neutral'
  if (tier === 'normal') healthVariant = 'ok'
  else if (tier === 'warning') healthVariant = 'warn'
  else if (tier === 'alert') healthVariant = 'alert'
  else if (tier === 'critical') healthVariant = 'danger'

  const healthLabel =
    tier === 'normal'
      ? 'Sistem Sağlıklı'
      : tier === 'warning'
        ? 'Sistem Uyarı'
        : tier === 'alert'
          ? 'Sistem Alarm'
          : 'Sistem Kritik'

  let mqttVariant: Parameters<typeof StatusDot>[0]['variant'] = mqttConnected ? 'ok' : 'danger'
  if (!mqttConnected && redisFallback) mqttVariant = 'warn'

  const mqttLabel = mqttConnected
    ? 'MQTT · Canlı'
    : redisFallback
      ? 'MQTT · Yedek Hat'
      : 'MQTT · Kapalı'

  return (
    <header className={cn('glass-header sticky top-0 z-50 border-b border-border px-s6 py-s4', className)}>
      <div className="mx-auto flex w-full max-w-content flex-wrap items-center justify-between gap-s4">
        <div className="flex items-center gap-s3">
          <Link to="/" className="flex items-center gap-s2 text-foreground no-underline">
            <Radar className="h-6 w-6 text-water" aria-hidden />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate">WEN Sistemi</p>
              <p className="font-display text-lg tracking-wide">Karar Destek Paneli</p>
            </div>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-s2">
          <WeatherWidget />
          <StatusDot variant={mqttVariant} label={mqttLabel} />
          <StatusDot variant={healthVariant} label={healthLabel} />

          {/* Profile & Notifications dropdown */}
          <div className="relative" ref={dropdownRef}>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsProfileOpen((p) => !p)
                setIsNotifOpen(false)
              }}
              className="relative z-50 font-mono uppercase tracking-[0.3em]"
            >
              <UserRound className="h-4 w-4 text-solar" aria-hidden />
              {displayName}
              {notifications.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </Button>

            {isProfileOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 flex w-56 flex-col gap-1 rounded-2xl border border-white/10 bg-[#0b1422]/95 p-2 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
                {/* Profil */}
                <button
                  className="flex w-full items-center gap-s2 rounded-md px-s3 py-s2 text-left text-sm text-foreground transition hover:bg-elevated/60"
                  onClick={() => { navigate('/profile'); closeProfile() }}
                >
                  <UserRound className="h-4 w-4 text-solar" aria-hidden />
                  Profil
                </button>

                {/* Bildirimler */}
                <button
                  className="flex w-full items-center justify-between gap-s2 rounded-md px-s3 py-s2 text-left text-sm text-foreground transition hover:bg-elevated/60"
                  onClick={() => setIsNotifOpen((p) => !p)}
                >
                  <span className="flex items-center gap-s2">
                    <Bell className="h-4 w-4 text-solar" aria-hidden />
                    Bildirimler
                  </span>
                  {notifications.length > 0 && (
                    <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="max-h-52 space-y-s1 overflow-y-auto rounded-md border border-border bg-elevated/40 p-s2">
                    {notifications.length === 0 ? (
                      <p className="px-s2 py-s3 text-center text-xs text-slate">Okunmamış bildirim yok.</p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => dismissNotification(n.id)}
                          className="flex w-full items-start gap-s2 rounded px-s2 py-s2 text-left text-xs transition hover:bg-elevated/80"
                          title="Tıkla ve kapat"
                        >
                          <X className="mt-px h-3 w-3 shrink-0 text-slate" aria-hidden />
                          <span className="flex-1 text-foreground">{n.message}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}

                <div className="my-1 border-t border-border" />

                {/* Ayarlar */}
                <Link
                  to="/settings"
                  onClick={closeProfile}
                  className="flex items-center gap-s2 rounded-md px-s3 py-s2 text-sm text-foreground no-underline transition hover:bg-elevated/60"
                >
                  <Settings className="h-4 w-4 text-slate" aria-hidden />
                  Ayarlar
                </Link>

                {/* Çıkış Yap */}
                <button
                  className="flex w-full items-center gap-s2 rounded-md px-s3 py-s2 text-left text-sm text-destructive transition hover:bg-red-soft"
                  onClick={() => { logout(); navigate('/login'); closeProfile() }}
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
