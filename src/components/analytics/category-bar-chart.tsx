import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { cn } from "@/lib/utils"

export type CategoryDatum = { label: string; value: number; highlight?: boolean }

/** A single-series vertical bar chart for ordered categories — age bands, purchase-frequency buckets, spend bands. */
export function CategoryBarChart({
  data,
  formatValue,
  color = "hsl(160 62% 22%)",
  highlightColor = "hsl(38 92% 45%)",
  height = 220,
  fill = false,
}: {
  data: CategoryDatum[]
  formatValue: (v: number) => string
  color?: string
  highlightColor?: string
  /** Fixed pixel height. Ignored when `fill` is true. */
  height?: number
  /** Grow to fill a flex-column parent's available height instead of a fixed height — for panels
   * that sit in a CSS Grid row next to a taller sibling, so the chart uses the stretched space
   * instead of leaving it blank below. Keeps a sane minimum height so it never collapses when
   * there's no extra space to fill (e.g. outside a stretched grid row). */
  fill?: boolean
}) {
  return (
    <div style={fill ? undefined : { height }} className={cn("w-full", fill && "min-h-[180px] flex-1")}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="hsl(220 16% 93%)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} tick={{ fontSize: 12, fill: "hsl(220 9% 46%)" }} />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }} width={52} tickFormatter={formatValue} />
          <Tooltip
            formatter={(value: number) => [formatValue(value), "Value"]}
            contentStyle={{ borderRadius: 10, border: "1px solid hsl(220 16% 91%)", boxShadow: "0 12px 24px -8px rgb(15 23 42 / 0.10)", fontSize: 12, fontFamily: "inherit" }}
            labelStyle={{ fontWeight: 600, marginBottom: 4, color: "hsl(220 20% 12%)" }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
            <LabelList dataKey="value" position="top" formatter={(v: number) => formatValue(v)} style={{ fontSize: 12, fontWeight: 600, fill: "hsl(220 20% 20%)" }} />
            {data.map((d) => (
              <Cell key={d.label} fill={d.highlight ? highlightColor : color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
