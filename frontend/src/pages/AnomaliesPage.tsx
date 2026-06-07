import { AlertCircle, ShieldAlert } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { useAnomalies } from '@/hooks/useAnomalies'
import { anomalySeverityBadgeClass, normalizeAnomalySeverity } from '@/lib/anomaly-severity'
import { useOpsStore } from '@/stores/ops-store'

export function AnomaliesPage() {
  const selectedFactoryId = useOpsStore((s) => s.selectedFactoryId)
  const anomalies = useAnomalies(selectedFactoryId)

  return (
    <div className="space-y-s6">
      <header className="space-y-s2">
        <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">/anomaliler</p>
        <div className="flex flex-wrap items-center gap-s3">
          <ShieldAlert className="h-8 w-8 text-energy" aria-hidden />
          <div>
            <h1 className="font-display text-4xl tracking-[0.12em]">Olay Günlükleri</h1>
            <p className="text-slate">MQTT + Timescale çıktılarının uyarı özeti mock verisidir.</p>
          </div>
        </div>
      </header>

      {anomalies.isLoading ? (
        <div className="grid gap-s4 lg:grid-cols-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : anomalies.isError ? (
        <div className="glass-card flex items-center gap-s4 p-s5">
          <AlertCircle className="h-6 w-6 shrink-0 text-destructive" aria-hidden />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-destructive">Yükleme Hatası</p>
            <p className="mt-s1 text-sm text-slate">Anomali verisi yüklenemedi</p>
          </div>
        </div>
      ) : anomalies.data?.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-s3 p-s8 text-center">
          <ShieldAlert className="h-10 w-10 text-slate" aria-hidden />
          <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-foreground">Aktif anomali kaydı bulunmuyor</p>
          <p className="text-xs text-slate">Sistem normal aralıkta çalışıyor · yeni olaylar burada görünecektir</p>
        </div>
      ) : (
        <div className="grid gap-s4 lg:grid-cols-3">
          {anomalies.data?.map((item) => (
            <article key={item.id} className="space-y-s3 rounded-2xl border border-border bg-card p-s6 shadow-card">
              <div className="flex items-center gap-s3 font-mono text-[11px] uppercase tracking-[0.45em] text-slate">
                <span className="text-foreground">{item.id}</span>
                <span className={anomalySeverityBadgeClass(item.severity)}>
                  {normalizeAnomalySeverity(item.severity)}
                </span>
              </div>
              <p className="text-base text-muted-foreground">{item.summary}</p>
              <p className="text-xs uppercase tracking-[0.35em] text-solar">{item.ts}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
