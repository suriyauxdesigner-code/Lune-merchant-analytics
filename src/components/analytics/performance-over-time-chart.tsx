import { CartesianGrid, Line, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { SeriesPoint } from "@/lib/mock-performance"
import { formatCompactAed, formatNumber } from "@/lib/utils"

const SERIES = [
  { key: "transactionValue", label: "Transaction Value (AED)", color: "hsl(160 62% 22%)", axis: "aed" as const },
  { key: "cashbackIssued", label: "Cashback Issued (AED)", color: "hsl(217 91% 55%)", axis: "aed" as const },
  { key: "transactions", label: "Transactions", color: "hsl(38 92% 45%)", axis: "count" as const },
]

export function PerformanceOverTimeChart({ data }: { data: SeriesPoint[] }) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {SERIES.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </div>
        ))}
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="hsl(220 16% 91%)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(220 9% 46%)" }} minTickGap={24} />
            <YAxis
              yAxisId="aed"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }}
              width={48}
              tickFormatter={(v) => formatCompactAed(v)}
            />
            <YAxis
              yAxisId="count"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }}
              width={44}
              tickFormatter={(v) => formatNumber(v)}
            />
            <Tooltip
              formatter={(value: number, name: string) => [name.includes("AED") ? formatCompactAed(value) : formatNumber(value), name]}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid hsl(220 16% 91%)",
                boxShadow: "0 12px 24px -8px rgb(15 23 42 / 0.10)",
                fontSize: 12,
                fontFamily: "inherit",
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4, color: "hsl(220 20% 12%)" }}
            />
            {SERIES.map((s) => (
              <Line
                key={s.key}
                yAxisId={s.axis}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
