import { Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { fetchSeriesSnapshots } from '@/lib/telemetry-mock'

async function exportCsv(rows: Array<{ energy: number; water: number; t: string }>) {
  const header = ['ts', 'energy_kwh', 'water_m3']

  const body = rows
    .map((row) => [row.t, row.energy, row.water].map((value) => (typeof value === 'string' ? `"${value}"` : `${value}`)).join(','))
    .join('\n')

  const blob = new Blob([`${header.join(',')}\n${body}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'wen-telem-history.csv'
  anchor.click()
  queueMicrotask(() => URL.revokeObjectURL(url))
}

export function HistoricalPage() {
  const handleDump = async () => {
    const snapshots = await fetchSeriesSnapshots(200)
    await exportCsv(snapshots)
  }

  return (
    <div className="space-y-s6">
      <header className="space-y-s2">
        <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">/ham-veri</p>
        <h1 className="font-display text-4xl">Ham telemetri dış aktarım</h1>
        <p className="text-slate">MQTT mock demetini `.csv` olarak indirin — parquet desteği sonraki iterasyonda eklenecek.</p>
      </header>

      <Button type="button" size="lg" className="w-full md:w-auto" onClick={() => void handleDump()}>
        <span className="inline-flex items-center gap-s3">
          <Download className="h-5 w-5" />
          Snapshot indir (.csv · 200 adım)
        </span>
      </Button>
    </div>
  )
}
