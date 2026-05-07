import { CloudSun } from 'lucide-react'

import { useOpsStore } from '@/stores/ops-store'

const BOSB_WEATHER = {
  location: 'BOSB · Bursa',
  condition: 'Parçalı Bulutlu',
  celsius: 22,
}

export function WeatherWidget() {
  const temperatureUnit = useOpsStore((s) => s.regional.temperatureUnit)
  const temp =
    temperatureUnit === 'F' ? Math.round(BOSB_WEATHER.celsius * 1.8 + 32) : BOSB_WEATHER.celsius

  return (
    <div className="inline-flex items-center gap-s2 rounded-pill border border-border bg-elevated px-s3 py-s2">
      <CloudSun className="h-4 w-4 text-solar" aria-hidden />
      <div className="leading-tight">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate">{BOSB_WEATHER.location}</p>
        <p className="text-xs text-foreground">
          {BOSB_WEATHER.condition} · {temp}°{temperatureUnit}
        </p>
      </div>
    </div>
  )
}
