import { Activity, AlertTriangle, Gauge, Settings, Terminal, WifiOff } from 'lucide-react'
import { type ComponentType, useMemo } from 'react'
import { Link } from 'react-router-dom'

import { AiSummaryCard } from '@/components/ai/AiSummaryCard'

import { useDateFormat } from '@/hooks/useDateFormat'

import { TechnicalLiveChart } from '@/components/charts/TechnicalLiveChart'
import { FactorySelector } from '@/components/factories/FactorySelector'
import { IoTGatewayPanel } from '@/components/iot/IoTGatewayPanel'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAnomalies } from '@/hooks/useAnomalies'
import { useLiveTelemetry, useTechnicalSeries } from '@/hooks/useLiveTelemetry'
import { anomalySeverityBadgeClass, normalizeAnomalySeverity } from '@/lib/anomaly-severity'
import { cn } from '@/lib/utils'
import { FACTORIES } from '@/mocks/factories'
import { useConnectionStore } from '@/stores/connection-store'
import { useCrisisStore } from '@/stores/crisis-store'
import { useOpsStore } from '@/stores/ops-store'
import { useThresholdStore } from '@/stores/threshold-store'

type SensorCardProps = {
  title: string
  value: string
  unit: string
  toneClass: string
  icon: ComponentType<{ className?: string }>
  sparkline: number[]
}

function Sparkline({ values, stroke }: { values: number[]; stroke: string }) {
  if (!values.length) return <div className="h-10" />

  const min = Math.min(...values)
  const max = Math.max(...values)
  const width = 220
  const height = 40

  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width
      const normalized = max === min ? 0.5 : (value - min) / (max - min)
      const y = height - normalized * height
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-10 w-full" preserveAspectRatio="none" aria-hidden>
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function SensorCard({ title, value, unit, toneClass, icon: Icon, sparkline }: SensorCardProps) {
  return (
    <article className="glass-card glass-card-hover p-s4">
      <div className="flex items-center justify-between gap-s3">
        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-slate">{title}</p>
        <Icon className="h-4 w-4 text-[#f0a500]" aria-hidden />
      </div>
      <p className={cn('mt-s2 text-2xl font-semibold', toneClass)}>
        {value}
        <span className="ml-s2 text-sm text-slate">{unit}</span>
      </p>
      <Sparkline values={sparkline} stroke="#f0a500" />
      <p className="mt-s1 text-[11px] text-slate">Son 10 saniye trendi</p>
    </article>
  )
}

export function TechnicalDashboardPage() {
  const live = useLiveTelemetry()
  const series = useTechnicalSeries()
  const selectedFactoryId = useOpsStore((s) => s.selectedFactoryId)
  const anomalies = useAnomalies(selectedFactoryId)
  const thresholds = useThresholdStore((s) => s.getValues(selectedFactoryId))
  const mqttConnected = useConnectionStore((s) => s.mqttConnected)
  const crisisLevel = useCrisisStore((s) => s.level)
  const scenario = useOpsStore((s) => s.scenario)
  const selectedFactory = FACTORIES.find((factory) => factory.id === selectedFactoryId)
  const scopedFactories = selectedFactory ? [selectedFactory] : FACTORIES
  const scenarioActive = scenario !== 'NONE'
  const isFactorySelected = Boolean(selectedFactory)
  const { fmtDateTime } = useDateFormat()

  const buffer = useMemo(() => {
    const rows = series.data ?? []
    return rows
      .slice(-10)
      .reverse()
      .map((row) => ({
        ts: row.t,
        energy: row.energy,
        water: row.water,
      }))
  }, [series.data])

  const latestRatio = useMemo(() => {
    if (!live.data?.water_m3) return null
    return live.data.energy_kwh / live.data.water_m3
  }, [live.data])

  const anomalyFeed = useMemo(() => {
    const feed = [...(anomalies.data ?? [])]
    const targetLabel = selectedFactory?.name ?? 'BOSB'
    const nowStr = fmtDateTime(new Date())

    if (latestRatio != null && (latestRatio < 0.8 || latestRatio > 1.5)) {
      feed.unshift({
        id: `RN-${new Date().getMinutes()}${new Date().getSeconds()}`,
        factoryId: selectedFactoryId === 'ALL' ? 'bosb' : selectedFactoryId,
        severity: latestRatio > 1.5 ? 'Kritik' : 'Uyarı',
        summary: `${targetLabel} Nexus oranı limit dışı: ${latestRatio.toFixed(2)} (hedef 0.8 - 1.5)`,
        ts: nowStr,
      })
    }
    if (scenario === 'HIGH_WATER') {
      feed.unshift({
        id: `SIM-W-${new Date().getSeconds()}`,
        factoryId: selectedFactoryId === 'ALL' ? 'bosb' : selectedFactoryId,
        severity: 'Kritik',
        summary: `${targetLabel} için simülasyon: Yüksek Su Tüketimi`,
        ts: nowStr,
      })
    }
    if (scenario === 'ENERGY_FLUCTUATION') {
      feed.unshift({
        id: `SIM-E-${new Date().getSeconds()}`,
        factoryId: selectedFactoryId === 'ALL' ? 'bosb' : selectedFactoryId,
        severity: 'Uyarı',
        summary: `${targetLabel} için simülasyon: Enerji Dalgalanması`,
        ts: nowStr,
      })
    }
    return feed.slice(0, 5)
  }, [anomalies.data, fmtDateTime, latestRatio, scenario, selectedFactory?.name, selectedFactoryId])

  const crisisGlow = crisisLevel === 'orange' || crisisLevel === 'red'
  const sensorRows = series.data ?? []
  const waterCutoff = crisisLevel === 'WATER_CUTOFF'
  const energyMultiplier = scenario === 'ENERGY_FLUCTUATION' ? 1.18 : selectedFactory ? selectedFactory.energyConsumption / 13 : 1
  const waterMultiplier = scenario === 'HIGH_WATER' ? 1.22 : selectedFactory ? selectedFactory.waterConsumption / 10.5 : 1
  const activeRows = sensorRows.map((row) => ({
    ...row,
    energy: Number((row.energy * energyMultiplier).toFixed(3)),
    water: waterCutoff ? 0 : Number((row.water * waterMultiplier).toFixed(3)),
  }))
  const bosbRows = sensorRows.map((row) => ({
    ...row,
    water: waterCutoff ? 0 : row.water,
  }))
  const pumpLoad = sensorRows.slice(-10).map((row) => Number(((row.energy * energyMultiplier) / 2.4).toFixed(2)))
  const valveOpen = sensorRows.slice(-10).map((row) => Number((Math.min(100, ((row.water * waterMultiplier) / thresholds.waterMax) * 100)).toFixed(1)))
  const inletPressure = sensorRows
    .slice(-10)
    .map((row) => Number((2.1 + (row.energy * energyMultiplier) / 20 + (row.water * waterMultiplier - thresholds.waterMin) / 12).toFixed(2)))
  const connectionScope = selectedFactory?.name ?? `${scopedFactories.length} fabrika`

  const handleFactoryReport = () => {
    const reportScope = selectedFactory?.name ?? 'BOSB-Bolge'
    window.alert(`${reportScope} için mock PDF rapor kuyruğa alındı.`)
  }

  return (
    <div
      className={cn(
        'space-y-s6 rounded-2xl border border-transparent p-s2',
        crisisGlow ? 'border-destructive/40 shadow-[inset_0_0_0_1px_rgba(232,0,15,0.25),0_0_32px_rgba(232,0,15,0.2)]' : '',
      )}
    >
      <header className="space-y-s2">
        <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">/operasyon-konsolu</p>
        <div className="flex flex-wrap items-center justify-between gap-s3">
          <div>
            <h1 className="font-display text-4xl tracking-[0.12em]">Operasyon Konsolu</h1>
            <p className="text-slate">Endüstriyel kontrol odası görünümü: canlı telemetri, eşik ve anomali takibi</p>
          </div>
          <div className="inline-flex items-center gap-s2 rounded-pill border border-border bg-elevated px-s4 py-s2 text-xs font-mono uppercase tracking-[0.35em] text-foreground">
            <span className={cn('h-2.5 w-2.5 rounded-full animate-pulse', mqttConnected ? 'bg-ok' : 'bg-destructive')} />
            MQTT {mqttConnected ? 'Bağlı' : 'Bağlantı Yok'}
          </div>
        </div>
      </header>

      <FactorySelector />

      {(crisisLevel === 'KOD_KIRMIZI' || crisisLevel === 'WATER_CUTOFF') ? (
        <section className="rounded-xl border border-destructive/60 bg-red-soft p-s4 text-sm font-semibold text-destructive shadow-[0_0_50px_rgba(239,68,68,0.5)]">
          ACİL DURUM MODU AKTİF - VERİLER BLOKE EDİLDİ / MANUEL KONTROL
        </section>
      ) : null}

      <section
        className={cn(
          'glass-card flex flex-wrap items-center justify-between gap-s3 p-s4',
          scenarioActive ? '!border-destructive/50 !bg-red-soft/40' : '',
        )}
      >
        <p className="font-mono text-sm tracking-[0.22em] text-slate">
          Teknik görünüm: <span className="text-foreground">{connectionScope}</span>
        </p>
        <Button variant="outline" size="sm" onClick={handleFactoryReport}>
          Fabrika Özel Raporu Al (.PDF)
        </Button>
      </section>

      <section className="glass-card space-y-s4 p-s5">
        <div className="flex items-center justify-between gap-s3">
          <h2 className="font-semibold tracking-[0.12em] text-[#f0a500]">
            {isFactorySelected ? `${selectedFactory?.name} Sensör Akışı` : 'Gerçek Zamanlı Sensör Akışı'}
          </h2>
          <span className="font-mono text-[11px] text-solar">
            ANLIK · {series.fetchStatus.toUpperCase()} · {series.isFetching ? 'güncelleniyor...' : 'canlı'}
          </span>
        </div>
        {series.isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : series.isError ? (
          <div className="flex items-center gap-s3 py-s4">
            <WifiOff className="h-5 w-5 shrink-0 text-warn" aria-hidden />
            <p className="font-mono text-sm text-warn">Canlı veri akışı kesildi · yeniden bağlanıyor…</p>
          </div>
        ) : (
          <TechnicalLiveChart rows={activeRows} thresholds={thresholds} />
        )}
      </section>

      <IoTGatewayPanel />

      {isFactorySelected ? (
        <section className="glass-card space-y-s4 p-s5">
          <div className="flex items-center justify-between gap-s3">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate">BOSB Genel Teknik Görünüm</h2>
            <span className="text-xs text-slate">Fabrika verileri üstte önceliklendirildi</span>
          </div>
          <TechnicalLiveChart rows={bosbRows} thresholds={useThresholdStore.getState().getValues('ALL')} />
          <div className="grid gap-s3 md:grid-cols-3">
            <article className="glass-card p-s4">
              <p className="text-xs text-slate">BOSB Son Enerji</p>
              <p className="mt-s1 text-lg font-semibold text-energy">
                {bosbRows.length ? bosbRows[bosbRows.length - 1].energy.toFixed(2) : '--'} kWh
              </p>
            </article>
            <article className="glass-card p-s4">
              <p className="text-xs text-slate">BOSB Son Su</p>
              <p className="mt-s1 text-lg font-semibold text-water">
                {bosbRows.length ? bosbRows[bosbRows.length - 1].water.toFixed(2) : '--'} m³/h
              </p>
            </article>
            <article className="glass-card p-s4">
              <p className="text-xs text-slate">BOSB Ortalama Rn</p>
              <p className="mt-s1 text-lg font-semibold text-foreground">
                {waterCutoff
                  ? '∞'
                  : bosbRows.length
                    ? (bosbRows.reduce((acc, row) => acc + row.energy / Math.max(row.water, 0.001), 0) / bosbRows.length).toFixed(2)
                    : '--'}
              </p>
            </article>
          </div>
        </section>
      ) : null}

      <section className="grid gap-s4 md:grid-cols-2 xl:grid-cols-3">
        <SensorCard
          title="Pompa Durumu"
          value={pumpLoad.length ? `${pumpLoad[pumpLoad.length - 1].toFixed(1)}` : '--'}
          unit="% load"
          toneClass="text-[#f0a500]"
          icon={Gauge}
          sparkline={pumpLoad}
        />
        <SensorCard
          title="Vana Açıklığı"
          value={valveOpen.length ? `${valveOpen[valveOpen.length - 1].toFixed(0)}` : '--'}
          unit="%"
          toneClass="text-solar"
          icon={Settings}
          sparkline={valveOpen}
        />
        <SensorCard
          title="Giriş Basıncı"
          value={inletPressure.length ? `${inletPressure[inletPressure.length - 1].toFixed(2)}` : '--'}
          unit="bar"
          toneClass="text-energy"
          icon={Activity}
          sparkline={inletPressure}
        />
      </section>

      <AiSummaryCard
        energyValue={live.data?.energy_kwh ?? 0}
        waterValue={live.data?.water_m3 ?? 0}
        nexusRatio={latestRatio ?? 0}
        anomalyFlag={latestRatio != null && (latestRatio < 0.8 || latestRatio > 1.5)}
      />

      <section className="grid gap-s4 xl:grid-cols-[minmax(0,1fr),320px]">
        <article className="space-y-s4 glass-card overflow-hidden border border-white/10 p-6">
          <div className="flex flex-wrap items-center justify-between gap-s3">
            <h2 className="font-semibold tracking-[0.12em] text-slate-100">Son MQTT Paketleri</h2>
            <span className="font-mono text-[11px] text-solar">Son 10 akış paketi</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-white/5 text-left font-mono text-xs uppercase tracking-wide text-cyan-400">
                <tr>
                  <th className="px-s4 py-3 font-semibold">Zaman Damgası</th>
                  <th className="px-s4 py-3 font-semibold">Enerji · kWh</th>
                  <th className="px-s4 py-3 font-semibold">Su Akışı · m³/h</th>
                  <th className="px-s4 py-3 font-semibold">Rn</th>
                </tr>
              </thead>
              <tbody>
                {buffer.map((row, index) => {
                  const rn = row.water > 0 ? (row.energy / row.water).toFixed(3) : '—'

                  return (
                    <tr
                      key={`${row.ts}-${index}`}
                      className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-s4 py-4 font-mono text-[12px] text-solar">{row.ts}</td>
                      <td className="px-s4 py-4 text-energy">{row.energy.toFixed(3)}</td>
                      <td className="px-s4 py-4 text-water">{row.water.toFixed(3)}</td>
                      <td className="px-s4 py-4 text-slate-100">{rn}</td>
                    </tr>
                  )
                })}
                {buffer.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-s4 py-s6 text-center text-slate">
                      Paketler gelene kadar simülatörden veri bekleniyor.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="glass-card space-y-s3 p-s5">
          <div className="flex items-center justify-between gap-s3">
            <h2 className="font-semibold uppercase tracking-[0.35em] text-[#f0a500]">Son Anomaliler</h2>
            <AlertTriangle className="h-4 w-4 text-[#f0a500]" />
          </div>
          <div className="space-y-s2">
            {anomalyFeed.map((item) => (
              <article key={item.id} className="glass-card glass-card-hover p-s3">
                <p className="flex flex-wrap items-center gap-s2 font-mono text-[11px] uppercase tracking-[0.35em] text-slate">
                  <span className="text-foreground">{item.id}</span>
                  <span className={anomalySeverityBadgeClass(item.severity)}>
                    {normalizeAnomalySeverity(item.severity)}
                  </span>
                </p>
                <p className="mt-s1 text-xs text-muted-foreground">{item.summary}</p>
                <p className="mt-s1 text-[11px] text-slate">{item.ts}</p>
              </article>
            ))}
            {anomalies.isLoading ? <p className="text-xs text-warn">Anomali akışı yükleniyor...</p> : null}
          </div>

          <Button
            asChild
            className={cn(
              'mt-s2 w-full border border-energy/40 bg-elevated text-foreground hover:bg-elevated/80',
              crisisGlow ? 'animate-pulse border-destructive/60 bg-red-soft text-destructive' : '',
            )}
          >
            <Link to="/crisis">
              <Terminal className="h-4 w-4" />
              Protokol Kontrolü
            </Link>
          </Button>
        </aside>
      </section>

      {latestRatio != null ? (
        <div className="rounded-lg border border-border bg-elevated/50 px-s4 py-s3 text-xs text-slate">
          Anlık Nexus oranı: <span className="font-semibold text-foreground">{waterCutoff ? '∞' : latestRatio.toFixed(3)}</span> · hedef bant: 0.8 - 1.5
        </div>
      ) : null}
    </div>
  )
}
