import { useMemo } from 'react'

type Props = {
  ratio: number | null
  className?: string
}

/** Yarım daire Nexus gauge; normalize aralık 0.5–2.0 görsel ölçektir */
export function NexusGauge({ ratio, className }: Props) {
  const { angle, label, tone } = useMemo(() => {
    if (ratio == null || !Number.isFinite(ratio))
      return { angle: 0, label: '--', tone: '#94a3b8' } as const

    const clamped = Math.min(Math.max(ratio, 0.42), 2.08)
    const span = clamped <= 2.08 ? (clamped - 0.42) / (2.08 - 0.42) : 1
    const angleDeg = 180 * span - 180
    let tone = '#94a3b8'
    if (ratio >= 0.8 && ratio <= 1.2) tone = 'var(--ok)'
    else if (ratio <= 1.5) tone = 'var(--warn)'
    else tone = 'var(--energy)'
    return { angle: angleDeg, label: ratio.toFixed(2), tone } as const
  }, [ratio])

  const arcTone =
    ratio == null ? '#475569' : ratio >= 0.8 && ratio <= 1.2 ? '#1dae6f' : ratio <= 1.5 ? '#f0b820' : '#f07c20'

  return (
    <div className={className}>
      <svg viewBox="0 0 220 136" aria-hidden role="img" focusable={false}>
        <defs>
          <linearGradient id="wenGauge" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(26,139,220,0.95)" />
            <stop offset="50%" stopColor="rgba(29,174,111,0.95)" />
            <stop offset="100%" stopColor="rgba(240,124,32,0.95)" />
          </linearGradient>
        </defs>
        <path
          d="M24 120 A88 88 0 0 1 196 120"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M24 120 A88 88 0 0 1 196 120"
          fill="none"
          stroke="url(#wenGauge)"
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray="276"
          strokeDashoffset={276 * (1 - Math.min(Math.max((ratio ?? 0.8) / 2.2, 0), 1))}
        />
        <g transform={`translate(110,120) rotate(${angle})`}>
          <line x1="0" y1="0" x2="0" y2="-78" stroke={arcTone} strokeWidth="4" strokeLinecap="round" />
          <circle r="6" fill={tone} />
        </g>
      </svg>
      <div className="mt-s2 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">Nexus oranı Rₙ</p>
        <p className="text-data-value text-foreground">{label}</p>
      </div>
    </div>
  )
}
