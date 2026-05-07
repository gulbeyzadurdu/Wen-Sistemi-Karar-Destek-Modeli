import { useEffect, useState } from 'react'

import { TechnicalLiveChart } from '@/components/charts/TechnicalLiveChart'
import { useLiveTelemetry, useTechnicalSeries } from '@/hooks/useLiveTelemetry'
import type { LivePacketRow } from '@/hooks/useLiveTelemetry'

import { useThresholdStore } from '@/stores/threshold-store'

export function TechnicalDashboardPage() {
  const live = useLiveTelemetry()
  const series = useTechnicalSeries()
  const thresholds = useThresholdStore((s) => s.values)

  const [buffer, setBuffer] = useState<LivePacketRow[]>([])

  useEffect(() => {
    if (!live.data) return

    const row: LivePacketRow = {
      ts: live.data.ts,
      energy: live.data.energy_kwh,
      water: live.data.water_m3,
    }
    setBuffer((prev) => [row, ...prev].slice(0, 10))
  }, [live.data])

  return (
    <div className="space-y-s6">
      <header className="space-y-s2">
        <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">/dashboard-technical</p>
        <h1 className="font-display text-4xl uppercase tracking-[0.2em]">Operasyon konsolu</h1>
        <p className="text-slate">MQTT mock akışından gelen iki eksen grafiği + son 10 ham paket</p>
      </header>

      <TechnicalLiveChart rows={series.data ?? []} thresholds={thresholds} />

      <section className="space-y-s3 rounded-xl border border-border bg-card p-s5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-s3">
          <h2 className="font-semibold uppercase tracking-[0.35em] text-slate">Son MQTT paketleri</h2>
          <span className="font-mono text-[11px] text-solar">
            POLL · {series.fetchStatus.toUpperCase()} · {series.isFetching ? 'güncelleniyor…' : 'istemci senk'}
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-elevated text-left font-mono text-[11px] uppercase tracking-[0.35em] text-slate">
              <tr>
                <th className="px-s4 py-s3">Ts</th>
                <th className="px-s4 py-s3">Enerji · kWh</th>
                <th className="px-s4 py-s3">Su · m³</th>
                <th className="px-s4 py-s3">Rn</th>
              </tr>
            </thead>
            <tbody>
              {(buffer.length ? buffer : []).map((row, index) => {
                const rn = row.water > 0 ? (row.energy / row.water).toFixed(3) : '—'

                return (
                  <tr key={`${row.ts}-${index}`} className="border-t border-border">
                    <td className="px-s4 py-s3 font-mono text-[12px] text-solar">{new Date(row.ts).toLocaleString('tr-TR')}</td>
                    <td className="px-s4 py-s3 text-energy">{row.energy.toFixed(3)}</td>
                    <td className="px-s4 py-s3 text-water">{row.water.toFixed(3)}</td>
                    <td className="px-s4 py-s3">{rn}</td>
                  </tr>
                )
              })}
              {buffer.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-s4 py-s6 text-center text-slate">
                    Paketler gelene kadar simülatörü bekleyin.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
