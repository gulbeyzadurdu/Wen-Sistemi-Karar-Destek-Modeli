import { Activity, Droplets, Layers3, TrendingUp, Zap } from 'lucide-react'
import { type ComponentType, useMemo } from 'react'

import { NexusGauge } from '@/components/charts/NexusGauge'
import { StrategicTrendChart } from '@/components/charts/StrategicTrendChart'
import { FactorySelector } from '@/components/factories/FactorySelector'
import { CrisisActionBanner } from '@/components/strategic/CrisisActionBanner'
import { useLiveTelemetry } from '@/hooks/useLiveTelemetry'
import { useNexusComputation, type NexusComputation } from '@/hooks/useNexus'
import { FACTORIES } from '@/mocks/factories'
import { useCrisisStore } from '@/stores/crisis-store'
import { useOpsStore } from '@/stores/ops-store'
import { Button } from '@/components/ui/button'

type Trend = 'up' | 'down'

type KpiCardProps = {
  title: string
  value: string
  detail: string
  accent: string
  trend?: { value: string; direction: Trend }
  progress?: number
  icon: ComponentType<{ className?: string }>
}

function KpiCard({ title, value, detail, accent, trend, progress, icon: Icon }: KpiCardProps) {
  return (
    <article className="rounded-xl border border-[#1f3248] bg-card p-s5 shadow-card">
      <div className="flex items-start justify-between gap-s3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">{title}</p>
          <p className="mt-s2 text-data-value" style={{ color: accent }}>
            {value}
          </p>
        </div>
        <Icon className="h-5 w-5 text-[#22a7d8]" aria-hidden />
      </div>
      <p className="mt-s2 text-xs text-slate">{detail}</p>
      {trend ? (
        <p className={`mt-s3 inline-flex items-center rounded-pill px-s3 py-s1 text-xs ${trend.direction === 'up' ? 'bg-ok-soft text-ok' : 'bg-warn-soft text-warn'}`}>
          <TrendingUp className={`mr-s2 h-3 w-3 ${trend.direction === 'down' ? 'rotate-180' : ''}`} />
          {trend.value}
        </p>
      ) : null}
      {progress != null ? (
        <div className="mt-s3">
          <div className="h-2 w-full rounded-full bg-elevated">
            <div className="h-2 rounded-full bg-[#22a7d8]" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
          </div>
          <p className="mt-s1 text-[11px] text-slate">Aylık hedef ilerlemesi: %{progress.toFixed(0)}</p>
        </div>
      ) : null}
    </article>
  )
}

function ratioTone(tier: NexusComputation['tier']) {
  if (tier === 'normal') return '#1dae6f'
  if (tier === 'alert' || tier === 'critical') return '#f07c20'
  return '#f0b820'
}

export function StrategicDashboardPage() {
  const telemetry = useLiveTelemetry()
  const selectedFactoryId = useOpsStore((s) => s.selectedFactoryId)
  const scenario = useOpsStore((s) => s.scenario)
  const crisisLevel = useCrisisStore((s) => s.level)
  const selectedFactory = FACTORIES.find((factory) => factory.id === selectedFactoryId)
  const isFactorySelected = Boolean(selectedFactory)
  const scopedFactories = selectedFactory ? [selectedFactory] : FACTORIES

  const bosbEnergyBase = FACTORIES.reduce((acc, factory) => acc + factory.energyConsumption, 0) / FACTORIES.length
  const bosbWaterBase = FACTORIES.reduce((acc, factory) => acc + factory.waterConsumption, 0) / FACTORIES.length
  const bosbRatioBase = FACTORIES.reduce((acc, factory) => acc + factory.nexusRatio, 0) / FACTORIES.length
  const baselineEnergy = scopedFactories.reduce((acc, factory) => acc + factory.energyConsumption, 0) / scopedFactories.length
  const baselineWater = scopedFactories.reduce((acc, factory) => acc + factory.waterConsumption, 0) / scopedFactories.length
  const baselineRatio = scopedFactories.reduce((acc, factory) => acc + factory.nexusRatio, 0) / scopedFactories.length

  const { ratio, tier } = useNexusComputation(telemetry.data?.energy_kwh, telemetry.data?.water_m3, false)

  const waterCutoff = crisisLevel === 'WATER_CUTOFF'
  const scenarioEnergyBoost = scenario === 'ENERGY_FLUCTUATION' ? 1.22 : 1
  const scenarioWaterBoost = scenario === 'HIGH_WATER' ? 1.28 : 1
  const liveEnergy = telemetry.data?.energy_kwh ?? bosbEnergyBase
  const liveWater = telemetry.data?.water_m3 ?? bosbWaterBase
  const factoryEnergyScale = selectedFactory ? baselineEnergy / bosbEnergyBase : 1
  const factoryWaterScale = selectedFactory ? baselineWater / bosbWaterBase : 1
  const factoryEnergy = liveEnergy * factoryEnergyScale * scenarioEnergyBoost
  const factoryWater = liveWater * factoryWaterScale * scenarioWaterBoost
  const bosbEnergy = liveEnergy
  const bosbWater = waterCutoff ? 0 : liveWater
  const energy = isFactorySelected ? factoryEnergy : bosbEnergy
  const water = waterCutoff ? 0 : isFactorySelected ? factoryWater : bosbWater
  const ratioForUi = isFactorySelected ? baselineRatio : bosbRatioBase
  const effectiveRatio = waterCutoff ? Number.POSITIVE_INFINITY : ratio ?? ratioForUi
  const prevEnergy = energy * (0.94 + ((energy * 17) % 7) / 100)
  const energyTrend = prevEnergy > 0 ? ((energy - prevEnergy) / prevEnergy) * 100 : 0
  const bosbPrevEnergy = bosbEnergy * (0.94 + ((bosbEnergy * 17) % 7) / 100)
  const bosbEnergyTrend = bosbPrevEnergy > 0 ? ((bosbEnergy - bosbPrevEnergy) / bosbPrevEnergy) * 100 : 0
  const monthlyWaterTarget = 12.4
  const waterProgress = water > 0 ? (water / monthlyWaterTarget) * 100 : 0
  const bosbWaterProgress = bosbWater > 0 ? (bosbWater / monthlyWaterTarget) * 100 : 0

  const buildTrendData = (baseEnergy: number, baseWater: number) => {
    const months = ['Oca', 'Sub', 'Mar', 'Nis', 'May', 'Haz']
    return months.map((month, index) => {
      const energyFactor = 0.86 + index * 0.035
      const waterFactor = 0.9 + index * 0.02
      return {
        month,
        energy: Number((baseEnergy * energyFactor).toFixed(2)),
        water: Number((baseWater * waterFactor).toFixed(2)),
      }
    })
  }

  const sixMonthData = useMemo(() => buildTrendData(energy || baselineEnergy, water || baselineWater), [energy, water, baselineEnergy, baselineWater])
  const bosbSixMonthData = useMemo(() => buildTrendData(bosbEnergy || bosbEnergyBase, bosbWater || bosbWaterBase), [bosbEnergy, bosbWater, bosbEnergyBase, bosbWaterBase])

  const avgEnergy = sixMonthData.reduce((acc, row) => acc + row.energy, 0) / sixMonthData.length
  const estimatedCost = avgEnergy * 0.145 * 30
  const carbonFootprint = avgEnergy * 0.41
  const bosbAvgEnergy = bosbSixMonthData.reduce((acc, row) => acc + row.energy, 0) / bosbSixMonthData.length
  const bosbEstimatedCost = bosbAvgEnergy * 0.145 * 30
  const bosbCarbonFootprint = bosbAvgEnergy * 0.41
  const scopeLabel = selectedFactory?.name ?? 'BOSB Genel Görünüm'
  const statusLabel = selectedFactory?.status ?? 'Online'
  const statusText = statusLabel === 'Online' ? 'Çevrimiçi' : statusLabel === 'Warning' ? 'Uyarı' : 'Çevrimdışı'
  const statusTone = statusLabel === 'Online' ? 'text-ok' : statusLabel === 'Warning' ? 'text-warn' : 'text-destructive'

  const handleFactoryReport = () => {
    const reportScope = selectedFactory?.name ?? 'BOSB-Bolge'
    window.alert(`${reportScope} için mock PDF rapor kuyruğa alındı.`)
  }

  return (
    <div className="space-y-s6">
      <header className="space-y-s2">
        <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">/dashboard-strategic</p>
        <div className="flex flex-wrap items-center gap-s4">
          <Layers3 className="h-8 w-8 text-[#22a7d8]" aria-hidden />
          <div>
            <h1 className="font-display text-4xl tracking-[0.12em]">Stratejik Kontrol Merkezi</h1>
            <p className="text-slate">ESG, maliyet ve Nexus verimlilik metriklerinin yönetici özet paneli</p>
          </div>
        </div>
      </header>

      <FactorySelector />

      {(crisisLevel === 'KOD_KIRMIZI' || crisisLevel === 'WATER_CUTOFF') ? (
        <section className="rounded-xl border border-destructive/60 bg-red-soft p-s4 text-sm font-semibold text-destructive shadow-[0_0_50px_rgba(239,68,68,0.5)]">
          ACİL DURUM MODU AKTİF - VERİLER BLOKE EDİLDİ / MANUEL KONTROL
        </section>
      ) : null}

      <section className="flex flex-wrap items-center justify-between gap-s3 rounded-xl border border-border bg-card p-s4">
        <p className="font-mono text-sm tracking-[0.2em] text-slate">
          Aktif kapsam: <span className="text-foreground">{scopeLabel}</span> · Durum:{' '}
          <span className={statusTone}>{statusText}</span>
        </p>
        <Button variant="outline" size="sm" onClick={handleFactoryReport}>
          Fabrika Özel Raporu Al (.PDF)
        </Button>
      </section>

      <CrisisActionBanner />

      <section className="grid gap-s4 md:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          title={isFactorySelected ? 'Fabrika Enerji (kWh)' : 'Toplam Enerji (kWh)'}
          value={energy > 0 ? energy.toFixed(2) : '--'}
          detail={isFactorySelected ? 'Seçili fabrika anlık enerji' : 'Anlık tüketim ve son döngü karşılaştırması'}
          accent="#22a7d8"
          trend={{ value: `${energyTrend >= 0 ? '+' : ''}${energyTrend.toFixed(1)}%`, direction: energyTrend >= 0 ? 'up' : 'down' }}
          icon={Zap}
        />
        <KpiCard
          title="Toplam Su (m³)"
          value={water > 0 ? water.toFixed(2) : '--'}
          detail="Aylık hedefe göre su kullanımı"
          accent="#3bcfcf"
          progress={waterProgress}
          icon={Droplets}
        />
        <KpiCard
          title="Nexus Orani (Rn)"
          value={Number.isFinite(effectiveRatio) ? effectiveRatio.toFixed(2) : '∞'}
          detail={`Sistem verimlilik seviyesi: ${tier.toUpperCase()}`}
          accent={ratioTone(effectiveRatio > 1.5 ? 'critical' : tier)}
          icon={Activity}
        />
      </section>

      {isFactorySelected ? (
        <section className="space-y-s4 rounded-xl border border-border bg-card p-s5">
          <div className="flex items-center justify-between gap-s3">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">BOSB Genel Verileri</h2>
            <span className="text-xs text-slate">Seçili fabrika üstte sabitlendi</span>
          </div>
          <div className="grid gap-s4 md:grid-cols-2 xl:grid-cols-3">
            <KpiCard
              title="BOSB Enerji (kWh)"
              value={bosbEnergy.toFixed(2)}
              detail="Bölge genel anlık enerji"
              accent="#22a7d8"
              trend={{ value: `${bosbEnergyTrend >= 0 ? '+' : ''}${bosbEnergyTrend.toFixed(1)}%`, direction: bosbEnergyTrend >= 0 ? 'up' : 'down' }}
              icon={Zap}
            />
            <KpiCard
              title="BOSB Su (m³)"
              value={bosbWater.toFixed(2)}
              detail="Bölge genel su kullanımı"
              accent="#3bcfcf"
              progress={bosbWaterProgress}
              icon={Droplets}
            />
            <KpiCard
              title="BOSB Nexus (Rn)"
              value={bosbRatioBase.toFixed(2)}
              detail="Bölge ortalama Nexus"
              accent={ratioTone(bosbRatioBase > 1.5 ? 'critical' : 'normal')}
              icon={Activity}
            />
          </div>
          <article className="rounded-xl border border-[#1f3248] bg-card p-s5 shadow-card">
            <div className="mb-s3 flex items-center justify-between gap-s3">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">BOSB Trend Analizi (6 Ay)</h3>
              <span className="text-xs text-[#22a7d8]">Enerji ve Su</span>
            </div>
            <StrategicTrendChart rows={bosbSixMonthData} />
            <div className="mt-s4 grid gap-s3 md:grid-cols-2">
              <p className="text-xs text-slate">Maliyet Tahmini: <span className="text-foreground">~ {bosbEstimatedCost.toFixed(0)} USD / ay</span></p>
              <p className="text-xs text-slate">Karbon Ayak İzi: <span className="text-foreground">~ {bosbCarbonFootprint.toFixed(2)} tCO2e</span></p>
            </div>
          </article>
        </section>
      ) : null}

      <section className="grid gap-s4 xl:grid-cols-[320px,minmax(0,1fr)]">
        <article className="rounded-xl border border-[#1f3248] bg-card p-s5 shadow-card">
          <h2 className="mb-s3 font-mono text-[11px] uppercase tracking-[0.45em] text-slate">Nexus Gauge</h2>
          <NexusGauge ratio={effectiveRatio} />
          <p className="mt-s3 text-xs text-slate">
            Rn 0.8-1.2 arası yeşil, 1.5 üstü turuncu/kırmızı risk bandı olarak yorumlanır.
          </p>
        </article>

        <div className="space-y-s4">
          <article className="rounded-xl border border-[#1f3248] bg-card p-s5 shadow-card">
            <div className="mb-s3 flex items-center justify-between gap-s3">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">ESG Trend Analizi (6 Ay)</h2>
              <span className="text-xs text-[#22a7d8]">Enerji ve Su</span>
            </div>
            <StrategicTrendChart rows={sixMonthData} />
          </article>

          <section className="grid gap-s4 md:grid-cols-2">
            <article className="rounded-xl border border-border bg-elevated/50 p-s5">
              <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-slate">Maliyet Tahmini</p>
              <p className="mt-s2 text-2xl font-semibold text-foreground">~ {estimatedCost.toFixed(0)} USD / ay</p>
              <p className="mt-s2 text-xs text-muted-foreground">Enerji birim maliyeti bazli yonetsel tahmin</p>
            </article>
            <article className="rounded-xl border border-border bg-elevated/50 p-s5">
              <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-slate">Karbon Ayak İzi</p>
              <p className="mt-s2 text-2xl font-semibold text-foreground">~ {carbonFootprint.toFixed(2)} tCO2e</p>
              <p className="mt-s2 text-xs text-muted-foreground">Enerji tüketimi tabanlı aylık emisyon projeksiyonu</p>
            </article>
          </section>
        </div>
      </section>

      {!telemetry.data && (
        <p className="text-sm text-warn">{telemetry.status === 'pending' ? 'Telemetri hazırlanıyor...' : 'Paket alınamadı · tekrar deneyin.'}</p>
      )}
    </div>
  )
}
