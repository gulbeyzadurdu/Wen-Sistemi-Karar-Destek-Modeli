import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  FileText,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'

import { getAiReport, type AiReportResult } from '@/lib/api-client'
import { cn } from '@/lib/utils'

type Period = 'weekly' | 'monthly'

type Props = {
  energyValue: number
  waterValue: number
  nexusRatio: number
  anomalyFlag: boolean
}

const RISK_CONFIG = {
  normal: {
    label: 'Normal — Faaliyet Hedefleri Dahilinde',
    icon: CheckCircle,
    badge: 'border-ok/40 bg-ok-soft text-ok',
    bar: 'bg-ok',
  },
  warning: {
    label: 'Uyarı — İzleme Gerektirir',
    icon: AlertTriangle,
    badge: 'border-warn/40 bg-warn-soft text-warn',
    bar: 'bg-warn',
  },
  critical: {
    label: 'Kritik — Acil Müdahale Gerektirir',
    icon: XCircle,
    badge: 'border-destructive/40 bg-red-soft text-destructive',
    bar: 'bg-destructive',
  },
} as const

function SectionHeader({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-s2 border-b border-border/40 pb-s2">
      <Icon className="h-4 w-4 text-[#22a7d8]" />
      <h3 className="font-mono text-[11px] uppercase tracking-[0.3em] text-slate">{title}</h3>
    </div>
  )
}

function ReportBody({ report }: { report: AiReportResult }) {
  const riskKey = (report.risk_level ?? 'normal') as keyof typeof RISK_CONFIG
  const risk = RISK_CONFIG[riskKey] ?? RISK_CONFIG.normal
  const RiskIcon = risk.icon

  return (
    <div className="space-y-s5">
      {/* Rapor kimliği */}
      <div className="flex flex-wrap items-start justify-between gap-s3 rounded-lg border border-border/30 bg-elevated/40 px-s4 py-s3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate">Rapor No</p>
          <p className="mt-s1 font-mono text-xs text-foreground">
            WEN-{report.period === 'weekly' ? 'H' : 'A'}-{report.report_date.replace(/\./g, '')}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate">Dönem</p>
          <p className="mt-s1 text-xs text-foreground">{report.period_label} Faaliyet Raporu</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate">Tarih</p>
          <p className="mt-s1 text-xs text-foreground">{report.report_date}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate">Hazırlayan</p>
          <p className="mt-s1 text-xs text-foreground">WEN Nexus · Yapay Zeka Modülü</p>
        </div>
      </div>

      {/* Genel Risk Durumu */}
      <div className={cn('flex items-center gap-s2 rounded-lg border px-s4 py-s3 font-semibold text-sm', risk.badge)}>
        <RiskIcon className="h-4 w-4 flex-shrink-0" />
        {risk.label}
      </div>

      {/* I. Yönetici Özeti */}
      <section className="space-y-s3">
        <SectionHeader icon={BookOpen} title="I. Yönetici Özeti" />
        <p className="text-sm leading-relaxed text-foreground">{report.executive_summary}</p>
      </section>

      {/* II. Temel Bulgular */}
      {report.findings.length > 0 && (
        <section className="space-y-s3">
          <SectionHeader icon={ClipboardList} title="II. Temel Bulgular" />
          <ol className="space-y-s2">
            {report.findings.map((finding, idx) => (
              <li key={idx} className="flex gap-s3 text-sm text-foreground">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#22a7d8]/15 font-mono text-[10px] font-semibold text-[#22a7d8]">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{finding}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* III. Risk Değerlendirmesi */}
      {report.risk_assessment && (
        <section className="space-y-s3">
          <SectionHeader icon={ShieldAlert} title="III. Risk Değerlendirmesi" />
          <p className="text-sm leading-relaxed text-foreground">{report.risk_assessment}</p>
        </section>
      )}

      {/* IV. Öneriler */}
      {report.recommendations.length > 0 && (
        <section className="space-y-s3">
          <SectionHeader icon={ChevronRight} title="IV. Öneriler ve Alınacak Tedbirler" />
          <ul className="space-y-s2">
            {report.recommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-s2 text-sm text-foreground">
                <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#22a7d8]" />
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* V. Uyum Notu */}
      {report.compliance_note && (
        <section className="space-y-s3">
          <SectionHeader icon={FileText} title="V. Mevzuat Uyumu ve Bildirim Yükümlülüğü" />
          <div className="rounded-lg border border-[#22a7d8]/20 bg-[#22a7d8]/5 px-s4 py-s3">
            <p className="text-sm leading-relaxed text-foreground">{report.compliance_note}</p>
          </div>
        </section>
      )}
    </div>
  )
}

export function AiReportCard({ energyValue, waterValue, nexusRatio, anomalyFlag }: Props) {
  const [activePeriod, setActivePeriod] = useState<Period>('weekly')
  const [results, setResults] = useState<Partial<Record<Period, AiReportResult>>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchReport(period: Period) {
    if (loading) return
    setActivePeriod(period)
    if (results[period]) return
    setLoading(true)
    setError(null)
    try {
      const data = await getAiReport({
        period,
        energy_value: energyValue,
        water_value: waterValue,
        nexus_ratio: nexusRatio,
        anomaly_flag: anomalyFlag,
      })
      setResults((prev) => ({ ...prev, [period]: data }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bağlantı hatası')
    } finally {
      setLoading(false)
    }
  }

  async function refreshReport() {
    setResults((prev) => {
      const next = { ...prev }
      delete next[activePeriod]
      return next
    })
    await fetchReport(activePeriod)
  }

  const currentReport = results[activePeriod]
  const riskKey = (currentReport?.risk_level ?? 'normal') as keyof typeof RISK_CONFIG
  const risk = RISK_CONFIG[riskKey] ?? RISK_CONFIG.normal

  return (
    <article className="glass-card overflow-hidden">
      {/* Renkli üst çizgi */}
      {currentReport && <div className={cn('h-1 w-full', risk.bar)} />}

      <div className="p-s5 space-y-s4">
        {/* Başlık */}
        <div className="flex flex-wrap items-center justify-between gap-s3">
          <div className="flex items-center gap-s2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#22a7d8]/20">
              <FileText className="h-4 w-4 text-[#22a7d8]" />
            </div>
            <div>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.35em] text-slate">
                Yapay Zeka · Faaliyet Raporu
              </h2>
              <p className="text-[10px] text-slate/60">
                Kamu kurumu rapor formatında AI destekli dönemsel analiz
              </p>
            </div>
          </div>

          <div className="flex items-center gap-s2">
            {/* Dönem seçici */}
            <div className="flex rounded-md border border-border/40 bg-elevated/60 p-0.5">
              {(['weekly', 'monthly'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setActivePeriod(p)
                    if (!results[p]) void fetchReport(p)
                  }}
                  className={cn(
                    'rounded px-s3 py-1 text-xs font-medium transition',
                    activePeriod === p
                      ? 'bg-[#22a7d8] text-white'
                      : 'text-slate hover:text-foreground',
                  )}
                >
                  {p === 'weekly' ? 'Haftalık' : 'Aylık'}
                </button>
              ))}
            </div>

            {/* Oluştur / Yenile */}
            <button
              onClick={() => {
                if (currentReport) void refreshReport()
                else void fetchReport(activePeriod)
              }}
              disabled={loading}
              className="flex items-center gap-s2 rounded-md border border-[#22a7d8]/30 bg-[#22a7d8]/10 px-s3 py-s1 text-xs text-[#22a7d8] transition hover:bg-[#22a7d8]/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
              {loading ? 'Rapor hazırlanıyor…' : currentReport ? 'Yenile' : 'Rapor Oluştur'}
            </button>
          </div>
        </div>

        {/* Boş durum */}
        {!currentReport && !loading && !error && (
          <div className="rounded-lg border border-dashed border-border/50 px-s4 py-s6 text-center">
            <FileText className="mx-auto mb-s2 h-8 w-8 text-slate/40" />
            <p className="text-sm text-slate">
              {activePeriod === 'weekly' ? 'Haftalık' : 'Aylık'} faaliyet raporu oluşturmak için
              &ldquo;Rapor Oluştur&rdquo; butonuna tıklayın.
            </p>
            <p className="mt-s1 text-xs text-slate/60">
              Rapor, Türk kamu kurumları faaliyet raporu formatında hazırlanır.
            </p>
          </div>
        )}

        {/* Yükleniyor */}
        {loading && (
          <div className="space-y-s3 rounded-lg bg-elevated/40 px-s4 py-s5">
            <div className="flex items-center gap-s3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#22a7d8] [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#22a7d8] [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#22a7d8] [animation-delay:300ms]" />
              <span className="text-xs text-slate">
                {activePeriod === 'weekly' ? 'Haftalık' : 'Aylık'} faaliyet raporu hazırlanıyor…
              </span>
            </div>
            {/* İskelet satırları */}
            {[80, 60, 90, 70, 50].map((w, i) => (
              <div key={i} className={`h-2.5 animate-pulse rounded bg-elevated`} style={{ width: `${w}%` }} />
            ))}
          </div>
        )}

        {/* Hata */}
        {error && (
          <p className="rounded-md border border-destructive/30 bg-red-soft px-s3 py-s2 text-xs text-destructive">
            {error}
          </p>
        )}

        {/* Rapor içeriği */}
        {currentReport && !loading && <ReportBody report={currentReport} />}
      </div>
    </article>
  )
}
