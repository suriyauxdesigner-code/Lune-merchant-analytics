import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium w-fit whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "bg-neutral-bg text-neutral-foreground",
        success: "bg-success-bg text-success-foreground",
        warning: "bg-warning-bg text-warning-foreground",
        info: "bg-info-bg text-info-foreground",
        destructive: "bg-destructive-bg text-destructive-foreground",
        primary: "bg-secondary text-secondary-foreground",
        outline: "border border-border text-foreground",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
)

function Badge({
  className,
  variant,
  dot = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { dot?: boolean }) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props}>
      {dot && (
        <span
          className={cn(
            "size-1.5 rounded-full",
            variant === "success" && "bg-success",
            variant === "warning" && "bg-warning",
            variant === "info" && "bg-info",
            variant === "destructive" && "bg-destructive",
            variant === "primary" && "bg-primary",
            (!variant || variant === "neutral") && "bg-neutral-foreground"
          )}
        />
      )}
      {props.children}
    </span>
  )
}

export { Badge, badgeVariants }
