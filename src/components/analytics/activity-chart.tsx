import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

type Point = { month: string; created: number; activated: number; completed: number }

const SERIES = [
  { key: "created", label: "Created", color: "hsl(220 9% 55%)" },
  { key: "activated", label: "Activated", color: "hsl(160 62% 22%)" },
  { key: "completed", label: "Completed", color: "hsl(217 91% 55%)" },
] as const

export function ActivityChart({ data }: { data: Point[] }) {
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
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="hsl(220 16% 91%)" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(220 9% 46%)" }} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(220 9% 46%)" }} width={32} />
            <Tooltip
              cursor={{ stroke: "hsl(220 16% 91%)" }}
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
              <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={{ r: 3, strokeWidth: 0, fill: s.color }} activeDot={{ r: 4 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
