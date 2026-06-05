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
        <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">/raporlar</p>
        <div className="flex flex-wrap items-center gap-s3">
          <ClipboardList className="h-8 w-8 text-water" aria-hidden />
          <div>
            <h1 className="font-display text-4xl uppercase tracking-[0.2em]">ESG çıktıları</h1>
            <p className="text-slate">Yeşil mutabakat veri blokları + WeasyPrint benzeri mock indirimi</p>
          </div>
        </div>
      </header>

      <article className="glass-card space-y-s6 overflow-hidden border border-white/10 p-6">
        {/* Canlı veri özeti */}
        <header className="border-b border-white/5 pb-s5">
          <p className="font-mono text-xs uppercase tracking-wide text-cyan-400">Canlı Anlık Özet</p>
          <p className="mt-s2 text-2xl font-semibold text-slate-100">{snapshot}</p>
          <p className="mt-s1 text-sm text-slate">
            Hesaplanan Nexus oranı Rn:{' '}
            <span className="font-semibold text-solar">{ratio != null ? ratio.toFixed(3) : '—'}</span>
          </p>
        </header>

        {/* Dışa aktarım seçenekleri */}
        <div className="space-y-s3">
          <p className="font-mono text-xs uppercase tracking-wide text-cyan-400">Dışa Aktarım</p>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-white/5 text-left font-mono text-xs uppercase tracking-wide text-cyan-400">
                <tr>
                  <th className="px-s4 py-3 font-semibold">Format</th>
                  <th className="px-s4 py-3 font-semibold">Kapsam</th>
                  <th className="px-s4 py-3 font-semibold">Boyut Tahmini</th>
                  <th className="px-s4 py-3 font-semibold">İşlem</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                  <td className="px-s4 py-4 font-mono text-[12px] text-solar">CSV · Profesyonel</td>
                  <td className="px-s4 py-4 text-slate-100">Tüm telemetri alanları + metadata</td>
                  <td className="px-s4 py-4 text-slate-100">~40 KB</td>
                  <td className="px-s4 py-4">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => exportIndustrialCsv(selectedFactoryId, crisisLevel)}
                    >
                      İndir
                    </Button>
                  </td>
                </tr>
                <tr className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                  <td className="px-s4 py-4 font-mono text-[12px] text-solar">CSV · Excel Uyumlu</td>
                  <td className="px-s4 py-4 text-slate-100">UTF-8 BOM · ISO tarih sütunları</td>
                  <td className="px-s4 py-4 text-slate-100">~38 KB</td>
                  <td className="px-s4 py-4">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => exportIndustrialExcelCompatible(selectedFactoryId, crisisLevel)}
                    >
                      İndir
                    </Button>
                  </td>
                </tr>
                <tr className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                  <td className="px-s4 py-4 font-mono text-[12px] text-solar">PDF · Kurumsal Rapor</td>
                  <td className="px-s4 py-4 text-slate-100">ESG + Nexus + KPI özet sayfaları</td>
                  <td className="px-s4 py-4 text-slate-100">~120 KB</td>
                  <td className="px-s4 py-4">
                    <PDFReportExporter />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <footer className="border-t border-white/5 pt-s4 text-xs leading-relaxed text-slate">
          PDF çıktıları backend WeasyPrint hattına bağlandığında aynı buton doğrudan{' '}
          <code className="rounded bg-elevated px-1 py-px text-solar">application/pdf</code> yanıtı indirecek.
        </footer>
      </article>
    </div>
  )
}
