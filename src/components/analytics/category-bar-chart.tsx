import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export type CategoryDatum = { label: string; value: number; highlight?: boolean }

/** A single-series vertical bar chart for ordered categories — age bands, purchase-frequency buckets, spend bands. */
export function CategoryBarChart({
  data,
  formatValue,
  color = "hsl(160 62% 22%)",
  highlightColor = "hsl(38 92% 45%)",
  height = 220,
}: {
  data: CategoryDatum[]
  formatValue: (v: number) => string
  color?: string
  highlightColor?: string
  height?: number
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="hsl(220 16% 93%)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} tick={{ fontSize: 12, fill: "hsl(220 9% 46%)" }} />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }} width={52} tickFormatter={formatValue} />
          <Tooltip
            formatter={(value: number) => [formatValue(value), "Value"]}
            contentStyle={{ borderRadius: 10, border: "1px solid hsl(220 16% 91%)", boxShadow: "0 12px 24px -8px rgb(15 23 42 / 0.10)", fontSize: 12, fontFamily: "inherit" }}
            labelStyle={{ fontWeight: 600, marginBottom: 4, color: "hsl(220 20% 12%)" }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
            {data.map((d) => (
              <Cell key={d.label} fill={d.highlight ? highlightColor : color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
