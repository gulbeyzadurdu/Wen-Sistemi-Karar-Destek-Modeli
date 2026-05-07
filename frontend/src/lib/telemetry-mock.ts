import { FACTORY_ANOMALY_HISTORY } from '@/mocks/anomalies'

export type LiveTelemetry = {
  energy_kwh: number
  water_m3: number
  ts: string
}

export type ChartRow = {
  t: string
  energy: number
  water: number
}

/** In-memory Nexus simulator keeps Rn ~= energy / water in spec bands via ratio-driven pairing */
const simState = {
  nexusRatio: 1.04,
  water_m3: 10.35,
}

let lastPacket: LiveTelemetry | null = null

export async function fetchLiveTelemetry(): Promise<LiveTelemetry> {
  simState.nexusRatio += (Math.random() - 0.5) * 0.07
  simState.nexusRatio = clamp(simState.nexusRatio, 0.65, 1.82)
  simState.water_m3 += (Math.random() - 0.5) * 0.22
  simState.water_m3 = clamp(simState.water_m3, 8.05, 12.95)

  const packet: LiveTelemetry = {
    energy_kwh: Number((simState.nexusRatio * simState.water_m3).toFixed(3)),
    water_m3: Number(simState.water_m3.toFixed(3)),
    ts: new Date().toISOString(),
  }

  /** Keep floating error from drifting the analytic ratio outside spec windows */
  const correctedRatio = packet.energy_kwh / packet.water_m3
  simState.nexusRatio = correctedRatio

  lastPacket = packet
  return packet
}

export async function fetchSeriesSnapshots(points = 140): Promise<ChartRow[]> {
  const anchor =
    lastPacket ??
    ({
      energy_kwh: simState.nexusRatio * simState.water_m3,
      water_m3: simState.water_m3,
      ts: new Date().toISOString(),
    }) satisfies LiveTelemetry

  const rows: ChartRow[] = []
  let ratio = clamp(anchor.energy_kwh / anchor.water_m3, 0.72, 1.75)
  let water = anchor.water_m3
  for (let i = points - 1; i >= 0; i -= 1) {
    ratio += (Math.random() - 0.5) * 0.04
    ratio = clamp(ratio, 0.72, 1.82)
    water += (Math.random() - 0.5) * 0.12
    water = clamp(water, 8.05, 12.95)

    rows.push({
      t: `Δ${points - i}pkt`,
      energy: Number((ratio * water).toFixed(3)),
      water: Number(water.toFixed(3)),
    })
  }

  rows.push({
    t: new Date(anchor.ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    energy: anchor.energy_kwh,
    water: anchor.water_m3,
  })

  return rows.slice(-Math.min(points, rows.length))
}

export async function fetchAnomalies(factoryId: 'ALL' | string = 'ALL') {
  const rows =
    factoryId === 'ALL'
      ? FACTORY_ANOMALY_HISTORY
      : FACTORY_ANOMALY_HISTORY.filter((entry) => entry.factoryId === factoryId)
  return rows
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}
