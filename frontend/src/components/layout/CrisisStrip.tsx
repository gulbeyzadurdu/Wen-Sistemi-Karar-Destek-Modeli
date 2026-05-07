import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { useCrisisStore } from '@/stores/crisis-store'

export function CrisisStrip({ className }: { className?: string }) {
  const level = useCrisisStore((s) => s.level)

  if (level === 'none') return null

  const tone =
    level === 'yellow'
      ? 'border-warn/40 bg-warn-soft text-warn'
      : level === 'orange'
        ? 'border-energy/40 bg-warn-soft text-energy'
        : 'border-destructive/40 bg-red-soft text-destructive'

  return (
    <div
      className={cn(
        'border-b px-s6 py-s2 text-center text-xs font-semibold uppercase tracking-[0.45em]',
        tone,
        className,
      )}
    >
      <span className="inline-flex flex-wrap items-center justify-center gap-s2">
        Nexus kriz seviyesi · {level}
        <Link to="/crisis" className="underline decoration-dotted underline-offset-4">
          Protokolü aç
        </Link>
      </span>
    </div>
  )
}
