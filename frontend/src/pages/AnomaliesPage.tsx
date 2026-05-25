import { ShieldAlert } from 'lucide-react'

import { useAnomalies } from '@/hooks/useAnomalies'
import { FACTORIES } from '@/mocks/factories'
import { useOpsStore } from '@/stores/ops-store'

export function AnomaliesPage() {
  const selectedFactoryId = useOpsStore((s) => s.selectedFactoryId)
  const selectedFactory = FACTORIES.find((factory) => factory.id === selectedFactoryId)
  const anomalies = useAnomalies(selectedFactoryId)

  return (
    <div className="space-y-s6">
      <header className="space-y-s2">
        <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">/anomaliler</p>
        <div className="flex flex-wrap items-center gap-s3">
          <ShieldAlert className="h-8 w-8 text-energy" aria-hidden />
          <div>
            <h1 className="font-display text-4xl uppercase tracking-[0.2em]">Olay günlükleri</h1>
            <p className="text-slate">MQTT + Timescale çıktılarının uyarı özeti mock verisidir.</p>
          </div>
        </div>
      </header>

      <div className="grid gap-s4 lg:grid-cols-3">
        {anomalies.data?.map((item) => (
          <article key={item.id} className="space-y-s3 rounded-2xl border border-border bg-card p-s6 shadow-card">
            <div className="flex items-center gap-s3 font-mono text-[11px] uppercase tracking-[0.45em] text-slate">
              <span className="text-foreground">{item.id}</span>
              <span className="rounded-pill bg-elevated px-s3 py-s1 text-energy">{item.severity}</span>
            </div>
            <p className="text-base text-muted-foreground">{item.summary}</p>
            <p className="text-xs uppercase tracking-[0.35em] text-solar">{item.ts}</p>
          </article>
        ))}
        {anomalies.isLoading ? <p className="text-sm text-warn font-mono uppercase tracking-[0.35em]">Veri bekleniyor…</p> : null}
      </div>
    </div>
  )
}
