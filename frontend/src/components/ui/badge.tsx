"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "success" | "warning"
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
        variant === "default" && "bg-primary/15 text-primary",
        variant === "outline" &&
          "border border-border/80 bg-background/60 text-muted-foreground",
        variant === "success" &&
          "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
        variant === "warning" &&
          "bg-amber-500/20 text-amber-700 dark:text-amber-300",
        className
      )}
      {...props}
    />
  )
)
Badge.displayName = "Badge"

export { Badge }

