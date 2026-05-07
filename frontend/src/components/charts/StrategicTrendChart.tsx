import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type StrategicTrendRow = {
  month: string
  energy: number
  water: number
}

type Props = {
  rows: StrategicTrendRow[]
}

export function StrategicTrendChart({ rows }: Props) {
  return (
    <div className="h-[320px] w-full rounded-xl border border-border bg-card p-s4 shadow-card">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22a7d8" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#22a7d8" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
          <YAxis yAxisId="left" tick={{ fill: '#22a7d8', fontSize: 11 }} width={42} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#3bcfcf', fontSize: 11 }} width={42} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--chart-tooltip-bg)',
              borderColor: 'var(--chart-tooltip-border)',
              borderRadius: 8,
            }}
            labelStyle={{ color: 'var(--chart-label)' }}
          />
          <Area yAxisId="left" dataKey="energy" fill="url(#energyFill)" stroke="#22a7d8" strokeWidth={2.5} name="Enerji (kWh)" />
          <Line yAxisId="right" type="monotone" dataKey="water" stroke="#3bcfcf" strokeWidth={2.5} dot={false} name="Su (m³)" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
