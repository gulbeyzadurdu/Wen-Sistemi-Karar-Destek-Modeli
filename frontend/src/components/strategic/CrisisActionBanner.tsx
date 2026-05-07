import { Flame } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { useCrisisStore } from '@/stores/crisis-store'

export function CrisisActionBanner({ className }: { className?: string }) {
  const level = useCrisisStore((s) => s.level)

  if (level === 'none') return null

  const tier =
    level === 'yellow'
      ? 'Gözlem modu aktif · trend takibini sürdürün'
      : level === 'orange'
        ? 'Hazırlık protokolü açılabilir · kod turuncuya geçiş'
        : 'Kod Kırmızı — zorunlu aksiyon seti bekleniyor'

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-s4 rounded-xl border px-s5 py-s4 font-semibold uppercase tracking-[0.35em] shadow-card duration-mid',
        level === 'red'
          ? 'border-destructive/70 bg-red-soft text-destructive animate-crisis-flash motion-reduce:animate-none motion-reduce:bg-red-soft'
          : level === 'orange'
            ? 'border-energy/70 bg-warn-soft text-energy'
            : 'border-warn/60 bg-warn-soft text-warn',
        className,
      )}
    >
      <div className="inline-flex items-center gap-s3 text-[11px]">
        <Flame className="h-5 w-5" aria-hidden />
        <span className="text-left normal-case tracking-normal text-base font-semibold text-foreground">
          Aktif Nexus krizi ({level}) — {tier.toLowerCase()}
        </span>
      </div>
      <Link
        className="inline-flex items-center justify-center rounded-md border border-border px-s4 py-s2 text-[11px] font-mono uppercase tracking-[0.4em] text-foreground underline-offset-4 hover:underline"
        to="/crisis"
      >
        Protokole git →
      </Link>
    </div>
  )
}
