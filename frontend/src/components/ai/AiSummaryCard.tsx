import { AlertTriangle, Bot, CheckCircle, ChevronRight, RefreshCw, XCircle } from 'lucide-react'
import { useState } from 'react'

import { getAiSummary, type AiSummaryResult } from '@/lib/api-client'
import { cn } from '@/lib/utils'

type Props = {
  energyValue: number
  waterValue: number
  nexusRatio: number
  anomalyFlag: boolean
}

const RISK_CONFIG = {
  normal: {
    label: 'Normal',
    icon: CheckCircle,
    badge: 'border-ok/40 bg-ok-soft text-ok',
    bar: 'bg-ok',
  },
  warning: {
    label: 'Uyarı',
    icon: AlertTriangle,
    badge: 'border-warn/40 bg-warn-soft text-warn',
    bar: 'bg-warn',
  },
  critical: {
    label: 'Kritik',
    icon: XCircle,
    badge: 'border-destructive/40 bg-red-soft text-destructive',
    bar: 'bg-destructive',
  },
} as const

export function AiSummaryCard({ energyValue, waterValue, nexusRatio, anomalyFlag }: Props) {
  const [result, setResult] = useState<AiSummaryResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchSummary() {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const data = await getAiSummary({
        energy_value: energyValue,
        water_value: waterValue,
        nexus_ratio: nexusRatio,
        anomaly_flag: anomalyFlag,
      })
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bağlantı hatası')
    } finally {
      setLoading(false)
    }
  }

  const riskKey = (result?.risk_level ?? 'normal') as keyof typeof RISK_CONFIG
  const risk = RISK_CONFIG[riskKey] ?? RISK_CONFIG.normal
  const RiskIcon = risk.icon

  return (
    <article className="glass-card overflow-hidden">
      {/* Renkli üst çizgi */}
      {result && (
        <div className={cn('h-1 w-full', risk.bar)} />
      )}

      <div className="p-s5 space-y-s4">
        {/* Başlık satırı */}
        <div className="flex items-center justify-between gap-s3">
          <div className="flex items-center gap-s2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#22a7d8]/20">
              <Bot className="h-4 w-4 text-[#22a7d8]" />
            </div>
            <div>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.35em] text-slate">
                Yapay Zeka · Anlık Analiz
              </h2>
              {result && (
                <p className="text-[10px] text-slate/60">
                  E={energyValue.toFixed(1)} kWh · S={waterValue.toFixed(1)} m³ · Rn={nexusRatio.toFixed(3)}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => void fetchSummary()}
            disabled={loading}
            className="flex items-center gap-s2 rounded-md border border-[#22a7d8]/30 bg-[#22a7d8]/10 px-s3 py-s1 text-xs text-[#22a7d8] transition hover:bg-[#22a7d8]/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
            {loading ? 'Analiz ediliyor…' : result ? 'Yenile' : 'Analiz Et'}
          </button>
        </div>

        {/* Boş durum */}
        {!result && !loading && !error && (
          <p className="text-xs text-slate">
            Mevcut telemetri verisi ile yapay zeka destekli anlık analiz almak için butona tıklayın.
          </p>
        )}

        {/* Yükleniyor */}
        {loading && (
          <div className="flex items-center gap-s3 py-s2">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#22a7d8] [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#22a7d8] [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#22a7d8] [animation-delay:300ms]" />
            <span className="text-xs text-slate">Model yanıtı bekleniyor…</span>
          </div>
        )}

        {/* Hata */}
        {error && (
          <p className="rounded-md border border-destructive/30 bg-red-soft px-s3 py-s2 text-xs text-destructive">
            {error}
          </p>
        )}

        {/* Sonuç */}
        {result && !loading && (
          <div className="space-y-s3">
            {/* Risk rozeti */}
            <div className={cn('inline-flex items-center gap-s2 rounded-full border px-s3 py-1 text-xs font-semibold', risk.badge)}>
              <RiskIcon className="h-3.5 w-3.5" />
              Risk Seviyesi: {risk.label}
            </div>

            {/* Yönetici Özeti */}
            <div className="rounded-lg bg-elevated/60 px-s4 py-s3">
              <p className="mb-s1 font-mono text-[10px] uppercase tracking-[0.3em] text-slate">
                Değerlendirme
              </p>
              <p className="text-sm leading-relaxed text-foreground">{result.summary}</p>
            </div>

            {/* Önerilen Aksiyon */}
            {result.action && (
              <div className="flex gap-s2 rounded-lg border border-[#22a7d8]/20 bg-[#22a7d8]/5 px-s4 py-s3">
                <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#22a7d8]" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#22a7d8]">
                    Önerilen Aksiyon
                  </p>
                  <p className="mt-s1 text-sm leading-relaxed text-foreground">{result.action}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
