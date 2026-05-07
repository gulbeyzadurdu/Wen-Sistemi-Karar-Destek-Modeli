import { Layers3 } from 'lucide-react'

import { NexusGauge } from '@/components/charts/NexusGauge'
import { CrisisActionBanner } from '@/components/strategic/CrisisActionBanner'
import { useLiveTelemetry } from '@/hooks/useLiveTelemetry'
import { useNexusComputation } from '@/hooks/useNexus'

export function StrategicDashboardPage() {
  const telemetry = useLiveTelemetry()

  const { ratio, tier } = useNexusComputation(telemetry.data?.energy_kwh, telemetry.data?.water_m3, false)

  const energy = telemetry.data?.energy_kwh != null ? telemetry.data.energy_kwh.toFixed(2) : '— —'
  const water = telemetry.data?.water_m3 != null ? telemetry.data.water_m3.toFixed(3) : '— —'

  return (
    <div className="space-y-s6">
      <header className="space-y-s2">
        <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">/dashboard-strategic</p>
        <div className="flex flex-wrap items-center gap-s4">
          <Layers3 className="h-8 w-8 text-energy" aria-hidden />
          <div>
            <h1 className="font-display text-4xl uppercase tracking-[0.2em]">Strateji gözleneği</h1>
            <p className="text-slate">Yöneticiler için özet KPI, Nexus gauge ve kriz bildirimi</p>
          </div>
        </div>
      </header>

      <CrisisActionBanner />

      <section className="grid gap-s4 xl:grid-cols-[280px,minmax(0,1fr)]">
        <NexusGauge ratio={ratio} />

        <div className="grid gap-s4 sm:grid-cols-3">
          <article className="rounded-xl border border-border bg-card p-s5 shadow-card">
            <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">Enerji (kWh)</p>
            <p className="text-data-value text-energy">{energy}</p>
          </article>
          <article className="rounded-xl border border-border bg-card p-s5 shadow-card">
            <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">Su (m³)</p>
            <p className="text-data-value text-water">{water}</p>
          </article>
          <article className="rounded-xl border border-border bg-card p-s5 shadow-card">
            <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">Nexus Tier</p>
            <p className="text-data-value text-solar">{tier.toUpperCase()}</p>
            <p className="mt-s2 text-xs text-slate">Canlı güncelleme için global mock telemetrisi kullanılıyor</p>
          </article>
        </div>
      </section>

      {!telemetry.data && (
        <p className="text-sm text-warn">{telemetry.status === 'pending' ? 'Telemetri hazırlanıyor…' : 'Paket beklenemedi · tekrar deneyin.'}</p>
      )}
    </div>
  )
}
