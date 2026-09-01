import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** A lightweight, card-free section header — for "open" sections (charts, breakdowns) that don't need a bordered box. */
export function SectionHeading({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode
  description?: string
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("mb-5 flex flex-wrap items-start justify-between gap-4", className)}>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  )
}
