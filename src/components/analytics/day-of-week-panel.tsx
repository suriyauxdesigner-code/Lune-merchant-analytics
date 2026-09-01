import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { formatCompactAed, formatRatio } from "@/lib/utils"
import type { WeekdayPoint } from "@/lib/mock-performance"

/** GMV and transactions by day of week — is this campaign's activity concentrated on particular days? */
export function DayOfWeekPanel({ weekday }: { weekday: WeekdayPoint[] }) {
  const active = weekday.filter((d) => d.transactionValue > 0)
  let peakCaption: string | null = null
  if (active.length >= 3) {
    const best = [...active].sort((a, b) => b.transactionValue - a.transactionValue)[0]
    const worst = [...active].sort((a, b) => a.transactionValue - b.transactionValue)[0]
    if (worst.transactionValue > 0 && best.day !== worst.day) {
      const multiple = best.transactionValue / worst.transactionValue
      peakCaption = `${best.day} generated ${formatRatio(multiple)} more GMV than ${worst.day}, the weakest day.`
    }
  }

  return (
    <div>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weekday} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="hsl(220 16% 93%)" />
            <XAxis dataKey="shortDay" tickLine={false} axisLine={false} tickMargin={10} tick={{ fontSize: 12, fill: "hsl(220 9% 46%)" }} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }} width={56} tickFormatter={formatCompactAed} />
            <Tooltip
              formatter={(value: number) => [formatCompactAed(value), "GMV"]}
              contentStyle={{ borderRadius: 10, border: "1px solid hsl(220 16% 91%)", boxShadow: "0 12px 24px -8px rgb(15 23 42 / 0.10)", fontSize: 12, fontFamily: "inherit" }}
              labelStyle={{ fontWeight: 600, marginBottom: 4, color: "hsl(220 20% 12%)" }}
            />
            <Bar dataKey="transactionValue" radius={[6, 6, 0, 0]}>
              {weekday.map((d) => (
                <Cell key={d.day} fill={d.isWeekend ? "hsl(38 92% 45%)" : "hsl(160 62% 22%)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {peakCaption ?? "GMV by day of week (Friday–Saturday shown as the UAE weekend)."}
      </p>
    </div>
  )
}
