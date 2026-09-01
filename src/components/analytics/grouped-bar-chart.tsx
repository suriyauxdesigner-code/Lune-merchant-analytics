import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export type GroupedBarSeries = { key: string; label: string; color: string }

/** A grouped bar chart — for comparing 2+ series (channels, segments) across shared categories (metrics, age bands, days). */
export function GroupedBarChart({
  data,
  series,
  formatValue,
  height = 240,
  showLegend = true,
}: {
  data: Record<string, string | number>[]
  series: GroupedBarSeries[]
  formatValue: (v: number) => string
  height?: number
  showLegend?: boolean
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
          <CartesianGrid vertical={false} stroke="hsl(220 16% 93%)" />
          <XAxis dataKey="category" tickLine={false} axisLine={false} tickMargin={10} tick={{ fontSize: 12, fill: "hsl(220 9% 46%)" }} />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }} width={52} tickFormatter={formatValue} />
          <Tooltip
            formatter={(value: number, name: string) => [formatValue(value), name]}
            contentStyle={{ borderRadius: 10, border: "1px solid hsl(220 16% 91%)", boxShadow: "0 12px 24px -8px rgb(15 23 42 / 0.10)", fontSize: 12, fontFamily: "inherit" }}
            labelStyle={{ fontWeight: 600, marginBottom: 4, color: "hsl(220 20% 12%)" }}
          />
          {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />}
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} maxBarSize={36} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
