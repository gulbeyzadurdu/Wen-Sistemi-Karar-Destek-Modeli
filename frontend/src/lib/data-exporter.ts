import { FACTORIES } from '@/mocks/factories'
import type { CrisisLevelUI } from '@/types/wen'

export type ExportRow = {
  'Zaman Damgası (ISO)': string
  'Fabrika ID': string
  'Sensör ID': string
  'Enerji Tüketimi (kWh)': string
  'Su Akışı (m³/h)': string
  'Nexus Oranı (Rn)': string
  'Sistem Durumu': string
}

function characteristicScale(factoryId: string) {
  if (factoryId === 'tekstil-a') return { energy: 0.92, water: 1.32 }
  if (factoryId === 'otomotiv-b') return { energy: 1.24, water: 0.88 }
  if (factoryId === 'gida-c') return { energy: 0.86, water: 1.12 }
  return { energy: 1.28, water: 1.04 }
}

function generateRows(selectedFactoryId: 'ALL' | string, crisisLevel: CrisisLevelUI): ExportRow[] {
  const targetFactories =
    selectedFactoryId === 'ALL'
      ? FACTORIES
      : FACTORIES.filter((factory) => factory.id === selectedFactoryId)

  const now = Date.now()
  const rows: ExportRow[] = []

  targetFactories.forEach((factory) => {
    const scale = characteristicScale(factory.id)
    for (let i = 0; i < 12; i += 1) {
      const ts = new Date(now - i * 60_000).toISOString()
      const sensorId = `${factory.id.toUpperCase()}-SNS-${String(i + 1).padStart(2, '0')}`
      const baseEnergy = factory.energyConsumption * scale.energy * (0.94 + (i % 5) * 0.03)
      const baseWater = factory.waterConsumption * scale.water * (0.9 + (i % 4) * 0.04)
      const water = crisisLevel === 'WATER_CUTOFF' ? 0 : Number(baseWater.toFixed(3))
      const energy = Number(baseEnergy.toFixed(3))
      const rn = water === 0 ? '∞' : (energy / water).toFixed(3)
      const systemStatus =
        crisisLevel === 'KOD_KIRMIZI'
          ? 'KOD KIRMIZI'
          : crisisLevel === 'WATER_CUTOFF'
            ? 'ACİL SU KESİNTİSİ'
            : factory.status === 'Online'
              ? 'NORMAL'
              : factory.status === 'Warning'
                ? 'UYARI'
                : 'ÇEVRİMDIŞI'

      rows.push({
        'Zaman Damgası (ISO)': ts,
        'Fabrika ID': factory.id,
        'Sensör ID': sensorId,
        'Enerji Tüketimi (kWh)': energy.toFixed(3),
        'Su Akışı (m³/h)': water === 0 ? '0.000' : water.toFixed(3),
        'Nexus Oranı (Rn)': rn,
        'Sistem Durumu': systemStatus,
      })
    }
  })

  return rows
}

function toCsv(rows: ExportRow[]) {
  const headers = Object.keys(rows[0] ?? {}) as Array<keyof ExportRow>
  const lines = [
    headers.join(';'),
    ...rows.map((row) =>
      headers
        .map((header) => `"${String(row[header]).replaceAll('"', '""')}"`)
        .join(';'),
    ),
  ]
  return `\uFEFF${lines.join('\n')}`
}

function downloadBlob(content: string, fileName: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  queueMicrotask(() => URL.revokeObjectURL(url))
}

function buildFileName(prefix: 'CSV' | 'EXCEL', crisisLevel: CrisisLevelUI) {
  const dateTag = new Date().toISOString().slice(0, 10)
  const statusTag =
    crisisLevel === 'KOD_KIRMIZI' || crisisLevel === 'WATER_CUTOFF' ? 'CRITICAL' : 'NORMAL'
  return `WEN_Report_${dateTag}_${statusTag}_${prefix}.csv`
}

export function exportIndustrialCsv(selectedFactoryId: 'ALL' | string, crisisLevel: CrisisLevelUI) {
  const rows = generateRows(selectedFactoryId, crisisLevel)
  const csv = toCsv(rows)
  downloadBlob(csv, buildFileName('CSV', crisisLevel))
}

export function exportIndustrialExcelCompatible(selectedFactoryId: 'ALL' | string, crisisLevel: CrisisLevelUI) {
  const rows = generateRows(selectedFactoryId, crisisLevel)
  const csv = toCsv(rows)
  downloadBlob(csv, buildFileName('EXCEL', crisisLevel))
}
