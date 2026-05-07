import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { ChartRow } from '@/lib/telemetry-mock'
import type { TelemetryThresholds } from '@/stores/threshold-store'

type Props = {
  rows: ChartRow[]
  thresholds: TelemetryThresholds
}

export function TechnicalLiveChart({ rows, thresholds }: Props) {
  return (
    <div className="h-[360px] w-full rounded-lg border border-border bg-card p-s4 shadow-card">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="t" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis
            yAxisId="water"
            orientation="left"
            tick={{ fill: '#1a8bdc', fontSize: 11 }}
            domain={['auto', 'auto']}
            label={{ value: 'Su (m³)', angle: -90, position: 'insideLeft', fill: '#1a8bdc' }}
          />
          <YAxis
            yAxisId="energy"
            orientation="right"
            tick={{ fill: '#f07c20', fontSize: 11 }}
            domain={['auto', 'auto']}
            label={{ value: 'Enerji (kWh)', angle: 90, position: 'insideRight', fill: '#f07c20' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0e141d',
              borderColor: 'rgba(255,255,255,0.12)',
              borderRadius: 8,
            }}
            labelStyle={{ color: '#e2e8f0', fontFamily: 'var(--font-mono)' }}
          />
          <Legend verticalAlign="top" height={32} formatter={(value) => <span style={{ color: '#cbd5f5' }}>{value}</span>} />
          <ReferenceLine yAxisId="water" y={thresholds.waterMin} stroke="#cbd5f5" strokeDasharray="5 8" opacity={0.45} />
          <ReferenceLine yAxisId="water" y={thresholds.waterMax} stroke="#cbd5f5" strokeDasharray="5 8" opacity={0.45} />
          <ReferenceLine yAxisId="energy" y={thresholds.energyMin} stroke="#fcd34d" strokeDasharray="5 8" opacity={0.45} />
          <ReferenceLine yAxisId="energy" y={thresholds.energyMax} stroke="#fcd34d" strokeDasharray="5 8" opacity={0.45} />

          <Line
            dot={false}
            type="monotone"
            yAxisId="water"
            dataKey="water"
            name="Su"
            stroke="var(--water)"
            strokeWidth={3}
          />
          <Line
            dot={false}
            type="monotone"
            yAxisId="energy"
            dataKey="energy"
            name="Enerji"
            stroke="var(--energy)"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
