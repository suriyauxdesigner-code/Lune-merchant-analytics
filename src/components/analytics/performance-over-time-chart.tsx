import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { SeriesPoint } from "@/lib/mock-performance"
import { formatCompactAed, formatNumber } from "@/lib/utils"

export type ChartMode = "value" | "transactions"

const VALUE_SERIES = [
  { key: "transactionValue", label: "Transaction Value", color: "hsl(160 62% 22%)" },
  { key: "cashbackIssued", label: "Cashback Issued", color: "hsl(217 91% 55%)" },
] as const

const COUNT_SERIES = [{ key: "transactions", label: "Transactions", color: "hsl(38 92% 45%)" }] as const

export function PerformanceOverTimeChart({ data, mode = "value" }: { data: SeriesPoint[]; mode?: ChartMode }) {
  const series = mode === "value" ? VALUE_SERIES : COUNT_SERIES
  const formatTick = mode === "value" ? formatCompactAed : formatNumber
  const formatTooltip = mode === "value" ? formatCompactAed : formatNumber

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-5 border-b border-border/70 pb-4">
        {series.map((s) => (
          <div key={s.key} className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </div>
        ))}
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="hsl(220 16% 93%)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} tick={{ fontSize: 12, fill: "hsl(220 9% 46%)" }} minTickGap={24} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }} width={52} tickFormatter={(v) => formatTick(v)} />
            <Tooltip
              formatter={(value: number, name: string) => [formatTooltip(value), name]}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid hsl(220 16% 91%)",
                boxShadow: "0 12px 24px -8px rgb(15 23 42 / 0.10)",
                fontSize: 12,
                fontFamily: "inherit",
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4, color: "hsl(220 20% 12%)" }}
            />
            {series.map((s) => (
              <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
