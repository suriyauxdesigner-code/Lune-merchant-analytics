import { cn } from "@/lib/utils"

export function BrandLogoTile({ initials, color, size = "md", className }: { initials: string; color: string; size?: "sm" | "md"; className?: string }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-border text-[11px] font-bold text-white",
        size === "sm" ? "size-8" : "size-11",
        className
      )}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  )
}
