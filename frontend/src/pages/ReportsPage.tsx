import { ClipboardList } from 'lucide-react'

import { PDFReportExporter } from '@/components/reports/PDFReportExporter'
import { useLiveTelemetry } from '@/hooks/useLiveTelemetry'
import { exportIndustrialCsv, exportIndustrialExcelCompatible } from '@/lib/data-exporter'
import { useNexusComputation } from '@/hooks/useNexus'
import { useOpsStore } from '@/stores/ops-store'
import { useCrisisStore } from '@/stores/crisis-store'
import { Button } from '@/components/ui/button'

export function ReportsPage() {
  const telemetry = useLiveTelemetry()
  const { ratio } = useNexusComputation(telemetry.data?.energy_kwh, telemetry.data?.water_m3)
  const selectedFactoryId = useOpsStore((s) => s.selectedFactoryId)
  const crisisLevel = useCrisisStore((s) => s.level)

  const snapshot = telemetry.data ? `${telemetry.data.energy_kwh} kWh / ${telemetry.data.water_m3} m³` : 'Paket bekleniyor'

  return (
    <div className="space-y-s6">
      <header className="space-y-s2">
        <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">/reports</p>
        <div className="flex flex-wrap items-center gap-s3">
          <ClipboardList className="h-8 w-8 text-water" aria-hidden />
          <div>
            <h1 className="font-display text-4xl uppercase tracking-[0.2em]">ESG çıktıları</h1>
            <p className="text-slate">Yeşil mutabakat veri blokları + WeasyPrint benzeri mock indirimi</p>
          </div>
        </div>
      </header>

      <article className="space-y-s4 rounded-2xl border border-border bg-card p-s8 shadow-card">
        <header className="space-y-s1">
          <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">Canlı öz</p>
          <p className="text-xl font-semibold text-foreground">{snapshot}</p>
          <p className="text-sm text-slate">
            Hesaplanan Nexus oranı Rn: <span className="font-semibold text-solar">{ratio != null ? ratio.toFixed(3) : '—'}</span>
          </p>
        </header>
        <div className="grid gap-s3 md:grid-cols-2">
          <Button type="button" variant="outline" onClick={() => exportIndustrialCsv(selectedFactoryId, crisisLevel)}>
            Profesyonel CSV Dışa Aktar
          </Button>
          <Button type="button" variant="secondary" onClick={() => exportIndustrialExcelCompatible(selectedFactoryId, crisisLevel)}>
            Excel Uyumlu CSV Dışa Aktar
          </Button>
        </div>
        <PDFReportExporter />
        <footer className="text-xs leading-relaxed text-slate">
          PDF çıktıları backend WeasyPrint hattına bağlandığında aynı buton doğrudan `application/pdf` yanıtı indirecek.
        </footer>
      </article>
    </div>
  )
}
