import { Radar } from 'lucide-react'

import { TechnicalLiveChart } from '@/components/charts/TechnicalLiveChart'
import { useTechnicalSeries } from '@/hooks/useLiveTelemetry'
import { useThresholdStore } from '@/stores/threshold-store'

export function AnalysisPage() {
  const series = useTechnicalSeries()
  const thresholds = useThresholdStore((s) => s.values)

  return (
    <div className="space-y-s6">
      <header className="space-y-s2">
        <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">/analysis</p>
        <div className="flex flex-wrap items-center gap-s3">
          <Radar className="h-7 w-7 text-energy" aria-hidden />
          <div>
            <h1 className="font-display text-4xl">Trend analizi</h1>
            <p className="text-slate">Stratejik roller için aynı veri yapısı, daha uzun aralıkta örnekleştirilir</p>
          </div>
        </div>
      </header>

      <TechnicalLiveChart rows={series.data ?? []} thresholds={thresholds} />
    </div>
  )
}
