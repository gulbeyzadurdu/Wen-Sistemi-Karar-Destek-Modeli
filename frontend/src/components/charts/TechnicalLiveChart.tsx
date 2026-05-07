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
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis dataKey="t" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
          <YAxis
            yAxisId="water"
            orientation="left"
            tick={{ fill: '#22a7d8', fontSize: 11 }}
            domain={['auto', 'auto']}
            label={{ value: 'Su Akisi (m³/h)', angle: -90, position: 'insideLeft', fill: '#22a7d8' }}
          />
          <YAxis
            yAxisId="energy"
            orientation="right"
            tick={{ fill: '#ffcf6a', fontSize: 11 }}
            domain={['auto', 'auto']}
            label={{ value: 'Enerji (kWh)', angle: 90, position: 'insideRight', fill: '#ffcf6a' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--chart-tooltip-bg)',
              borderColor: 'var(--chart-tooltip-border)',
              borderRadius: 8,
            }}
            labelStyle={{ color: 'var(--chart-label)', fontFamily: 'var(--font-mono)' }}
          />
          <Legend verticalAlign="top" height={32} formatter={(value) => <span style={{ color: 'var(--chart-label)' }}>{value}</span>} />
          <ReferenceLine yAxisId="water" y={thresholds.waterMin} stroke="#f0a500" strokeDasharray="5 8" opacity={0.45} />
          <ReferenceLine yAxisId="water" y={thresholds.waterMax} stroke="#f0a500" strokeDasharray="5 8" opacity={0.45} />
          <ReferenceLine yAxisId="energy" y={thresholds.energyMin} stroke="#ffcf6a" strokeDasharray="5 8" opacity={0.45} />
          <ReferenceLine yAxisId="energy" y={thresholds.energyMax} stroke="#ffcf6a" strokeDasharray="5 8" opacity={0.45} />

          <Line
            dot={false}
            type="monotone"
            yAxisId="water"
            dataKey="water"
            name="Su"
            stroke="#22a7d8"
            strokeWidth={3}
          />
          <Line
            dot={false}
            type="monotone"
            yAxisId="energy"
            dataKey="energy"
            name="Enerji"
            stroke="#ffcf6a"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
