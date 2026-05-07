import { Radar, Shield, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useLiveTelemetry } from '@/hooks/useLiveTelemetry'
import { useNexusComputation } from '@/hooks/useNexus'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCrisisStore } from '@/stores/crisis-store'
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

  const mqttConnected = useConnectionStore((s) => s.mqttConnected)
  const redisFallback = useConnectionStore((s) => s.redisFallbackActive)

  const telemetry = useLiveTelemetry()

  const lockedRed = useCrisisStore((s) => s.manualLock && (s.level === 'red' || s.level === 'KOD_KIRMIZI' || s.level === 'WATER_CUTOFF'))

  const { tier } = useNexusComputation(
    telemetry.data?.energy_kwh,
    telemetry.data?.water_m3,
    lockedRed,
  )

  let healthVariant: Parameters<typeof StatusDot>[0]['variant'] = 'neutral'
  if (tier === 'normal') healthVariant = 'ok'
  else if (tier === 'warning') healthVariant = 'warn'
  else if (tier === 'alert') healthVariant = 'alert'
  else if (tier === 'critical') healthVariant = 'danger'

  let mqttVariant: Parameters<typeof StatusDot>[0]['variant'] = mqttConnected ? 'ok' : 'danger'
  if (!mqttConnected && redisFallback) mqttVariant = 'warn'

  const mqttLabel = mqttConnected
    ? 'MQTT · Canlı'
    : redisFallback
      ? 'MQTT · Yedek Hat'
      : 'MQTT · Kapalı'

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-border bg-base/92 px-s6 py-s4 backdrop-blur-md',
        className,
      )}
    >
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
          <StatusDot variant={healthVariant} label={`SİSTEM · ${tier.toUpperCase()}`} />

          <Button variant="secondary" size="sm" asChild className="font-mono uppercase tracking-[0.3em]">
            <Link to="/crisis" className="inline-flex items-center gap-s2 no-underline">
              <Shield className="h-4 w-4 text-destructive" />
              Kriz
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild className="font-mono uppercase tracking-[0.3em]">
            <Link to="/settings" className="inline-flex items-center gap-s2 no-underline">
              <UserRound className="h-4 w-4 text-solar" aria-hidden />
              {displayName}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
