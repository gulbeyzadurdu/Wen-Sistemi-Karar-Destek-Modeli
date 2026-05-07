import { Database, Radio } from 'lucide-react'

import { cn } from '@/lib/utils'

type Props = {
  mqttConnected: boolean
  redisFallbackActive: boolean
  className?: string
}

export function DataOfflineBanner({ mqttConnected, redisFallbackActive, className }: Props) {
  if (mqttConnected) return null

  return (
    <aside
      className={cn(
        'flex items-center justify-center gap-s2 px-s4 py-s3 text-xs font-semibold uppercase tracking-[0.3em]',
        redisFallbackActive ? 'bg-warn-soft text-warn' : 'bg-red-soft text-destructive',
        className,
      )}
      role="status"
    >
      <Radio className="h-4 w-4 animate-pulse" aria-hidden />
      <span>Data offline · {redisFallbackActive ? 'Redis fallback aktif' : 'Yedek yok · operasyon bekliyor'}</span>
      {redisFallbackActive ? <Database className="h-4 w-4 opacity-85" aria-hidden /> : null}
    </aside>
  )
}
