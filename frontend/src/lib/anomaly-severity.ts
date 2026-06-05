import { cn } from '@/lib/utils'

export type AnomalySeverity = 'Kritik' | 'Uyarı' | 'Bilgi'

const SEVERITY_BADGE: Record<AnomalySeverity, string> = {
  Kritik: 'bg-red-soft text-destructive',
  Uyarı: 'bg-warn-soft text-warn',
  Bilgi: 'bg-ok-soft text-ok',
}

const LEGACY_ALIASES: Record<string, AnomalySeverity> = {
  kritik: 'Kritik',
  uyarı: 'Uyarı',
  uyari: 'Uyarı',
  bilgi: 'Bilgi',
  turuncu: 'Uyarı',
  sarı: 'Uyarı',
  sari: 'Uyarı',
  yeşil: 'Bilgi',
  yesil: 'Bilgi',
  normal: 'Bilgi',
}

export function normalizeAnomalySeverity(severity: string): AnomalySeverity {
  const direct = SEVERITY_BADGE[severity as AnomalySeverity]
  if (direct) return severity as AnomalySeverity

  const alias = LEGACY_ALIASES[severity.toLocaleLowerCase('tr-TR')]
  return alias ?? 'Uyarı'
}

export function anomalySeverityBadgeClass(severity: string, className?: string) {
  const level = normalizeAnomalySeverity(severity)
  return cn('rounded-pill px-s3 py-s1 font-mono text-[11px] uppercase tracking-[0.35em]', SEVERITY_BADGE[level], className)
}
