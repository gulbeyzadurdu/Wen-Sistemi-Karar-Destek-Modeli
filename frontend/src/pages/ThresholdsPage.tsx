import type { ChangeEvent } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import {
  DEFAULT_THRESHOLDS,
  type TelemetryThresholds,
  useThresholdStore,
} from '@/stores/threshold-store'

export function ThresholdsPage() {
  const thresholds = useThresholdStore((state) => state.values)
  const setThresholds = useThresholdStore((state) => state.setValues)

  const handleChange =
    (key: keyof TelemetryThresholds) =>
    ({ target }: ChangeEvent<HTMLInputElement>) =>
      setThresholds({ ...thresholds, [key]: Number.parseFloat(target.value) })

  return (
    <div className="space-y-s6">
      <header className="space-y-s2">
        <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">/thresholds</p>
        <h1 className="font-display text-4xl">Sensör eşikleri</h1>
        <p className="text-slate">Grafik üzerindeki kesik çizgiler doğrudan bu değerlere bağlanır · mock olarak Zustanda tutuluyor.</p>
      </header>

      <section className="grid gap-s5 md:grid-cols-2">
        {(Object.entries(thresholds) as Array<[keyof TelemetryThresholds, number]>).map(([key, value]) => {
          const formatted =
            key.startsWith('water') ? `${value.toFixed(3)} m³` : `${value.toFixed(2)} kWh`

          const label =
            key === 'energyMin'
              ? 'Enerji · minimum'
              : key === 'energyMax'
                ? 'Enerji · maksimum'
                : key === 'waterMin'
                  ? 'Su · minimum'
                  : 'Su · maksimum'

          return (
            <label key={key} className={cn('space-y-s3 rounded-2xl border border-border bg-card p-s6 shadow-card')}>
              <div className="flex justify-between gap-s3 font-mono text-[11px] uppercase tracking-[0.45em] text-slate">
                <span>{label}</span>
                <span className="text-foreground">{formatted}</span>
              </div>
              <input
                type="range"
                step={key.startsWith('water') ? '0.001' : '0.1'}
                min={key.includes('energy') ? 4 : 7.85}
                max={key.includes('energy') ? 24 : 13.05}
                value={value}
                onChange={handleChange(key)}
                className="w-full accent-solar"
              />
            </label>
          )
        })}
      </section>

      <Button type="button" variant="outline" size="lg" className="w-full md:w-auto" onClick={() => setThresholds(DEFAULT_THRESHOLDS)}>
        Fabrika varsayılanlarına sıfırla
      </Button>
    </div>
  )
}
