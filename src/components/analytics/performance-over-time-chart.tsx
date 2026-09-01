import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { SeriesPoint } from "@/lib/mock-performance"
import { formatCompactAed, formatNumber, formatRatio } from "@/lib/utils"

export type ChartMetric = "gmv" | "transactions" | "cashback" | "roi" | "aov"

export const CHART_METRIC_OPTIONS: { value: ChartMetric; label: string }[] = [
  { value: "gmv", label: "GMV" },
  { value: "transactions", label: "Transactions" },
  { value: "cashback", label: "Cashback" },
  { value: "roi", label: "ROI" },
  { value: "aov", label: "AOV" },
]

const METRIC_CONFIG: Record<ChartMetric, { color: string; format: (v: number) => string }> = {
  gmv: { color: "hsl(160 62% 22%)", format: formatCompactAed },
  transactions: { color: "hsl(38 92% 45%)", format: formatNumber },
  cashback: { color: "hsl(217 91% 55%)", format: formatCompactAed },
  roi: { color: "hsl(266 65% 58%)", format: (v) => formatRatio(v) },
  aov: { color: "hsl(340 70% 50%)", format: formatCompactAed },
}

function pointValue(p: SeriesPoint, metric: ChartMetric) {
  if (metric === "gmv") return p.transactionValue
  if (metric === "transactions") return p.transactions
  if (metric === "cashback") return p.cashbackIssued
  if (metric === "aov") return p.transactions > 0 ? p.transactionValue / p.transactions : 0
  return p.cashbackIssued > 0 ? p.transactionValue / p.cashbackIssued : 0
}

/** Shows exactly one metric at a time — GMV, Transactions, Cashback and ROI live on very different scales, so they never share an axis. */
export function PerformanceOverTimeChart({ data, metric = "gmv" }: { data: SeriesPoint[]; metric?: ChartMetric }) {
  const config = METRIC_CONFIG[metric]
  const chartData = data.map((p) => ({ label: p.label, value: pointValue(p, metric) }))
  const option = CHART_METRIC_OPTIONS.find((o) => o.value === metric)!

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-5 border-b border-border/70 pb-4">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="size-2 rounded-full" style={{ backgroundColor: config.color }} />
          {option.label}
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="hsl(220 16% 93%)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} tick={{ fontSize: 12, fill: "hsl(220 9% 46%)" }} minTickGap={24} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }} width={56} tickFormatter={(v) => config.format(v)} />
            <Tooltip
              formatter={(value: number) => [config.format(value), option.label]}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid hsl(220 16% 91%)",
                boxShadow: "0 12px 24px -8px rgb(15 23 42 / 0.10)",
                fontSize: 12,
                fontFamily: "inherit",
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4, color: "hsl(220 20% 12%)" }}
            />
            <Line type="monotone" dataKey="value" name={option.label} stroke={config.color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
