"use client"

import * as React from "react"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"

import { cn } from "@/lib/utils"

const icons = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle2,
}

export type AlertVariant = keyof typeof icons

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const Icon = icons[variant]

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "flex w-full items-start gap-3 rounded-xl border border-border/60 bg-card/80 px-4 py-3 text-sm shadow-sm backdrop-blur transition-colors",
          variant === "destructive" &&
            "border-destructive/50 bg-destructive/10 text-destructive",
          variant === "success" &&
            "border-primary/50 bg-primary/10 text-primary",
          className
        )}
        {...props}
      >
        <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <div className="grid gap-1">{children}</div>
      </div>
    )
  }
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("font-semibold tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("leading-relaxed text-muted-foreground", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }

