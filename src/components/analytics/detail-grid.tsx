import type { ReactNode } from "react"

export type DetailItem = { icon: ReactNode; label: string; value: ReactNode }

export function DetailGrid({ items }: { items: DetailItem[] }) {
  return (
    <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-primary">{item.icon}</div>
          <div>
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="text-sm font-semibold text-foreground">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
