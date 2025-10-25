"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type FieldProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "vertical" | "horizontal";
  "data-invalid"?: boolean;
  "data-disabled"?: boolean;
};

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  (
    {
      className,
      orientation = "vertical",
      "data-invalid": invalid,
      "data-disabled": disabled,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      data-slot="field"
      data-orientation={orientation}
      data-invalid={invalid ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      className={cn(
        "flex gap-2 data-[orientation=vertical]:flex-col data-[orientation=horizontal]:items-start data-[orientation=horizontal]:gap-3",
        "relative rounded-xl border border-transparent p-3 transition-colors",
        "data-[invalid]:border-destructive/30 data-[invalid]:bg-destructive/5",
        "data-[disabled]:opacity-60",
        className
      )}
      {...props}
    />
  )
);
Field.displayName = "Field";

const FieldGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="field-group"
    className={cn("flex flex-col gap-6", className)}
    {...props}
  />
));
FieldGroup.displayName = "FieldGroup";

const FieldSet = React.forwardRef<
  HTMLFieldSetElement,
  React.HTMLAttributes<HTMLFieldSetElement>
>(({ className, ...props }, ref) => (
  <fieldset
    ref={ref}
    data-slot="fieldset"
    className={cn("flex flex-col gap-5 rounded-2xl border border-border/60 p-6", className)}
    {...props}
  />
));
FieldSet.displayName = "FieldSet";

const FieldLegend = React.forwardRef<
  HTMLLegendElement,
  React.HTMLAttributes<HTMLLegendElement> & { variant?: "default" | "label" }
>(({ className, variant = "default", ...props }, ref) => (
  <legend
    ref={ref}
    data-slot="field-legend"
    data-variant={variant}
    className={cn(
      "text-base font-semibold text-foreground",
      variant === "label" && "text-sm font-medium uppercase tracking-wide text-muted-foreground",
      className
    )}
    {...props}
  />
));
FieldLegend.displayName = "FieldLegend";

const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    data-slot="field-label"
    className={cn("text-sm font-semibold text-foreground", className)}
    {...props}
  />
));
FieldLabel.displayName = "FieldLabel";

const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="field-description"
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
FieldDescription.displayName = "FieldDescription";

type FieldErrorProps = React.HTMLAttributes<HTMLParagraphElement> & {
  errors?: Array<{ message?: string | null } | string | null | undefined>;
};

const FieldError = React.forwardRef<HTMLParagraphElement, FieldErrorProps>(
  ({ className, errors, children, ...props }, ref) => {
    const messages =
      errors?.flatMap((error) => {
        if (typeof error === "string") return error;
        if (error && typeof error === "object" && "message" in error) {
          return error.message ?? null;
        }
        return null;
      })
        .filter((message): message is string => Boolean(message)) ?? [];

    if (!children && messages.length === 0) {
      return null;
    }

    return (
      <p
        ref={ref}
        data-slot="field-error"
        className={cn("text-sm font-medium text-destructive", className)}
        {...props}
      >
        {children ?? messages.join(", ")}
      </p>
    );
  }
);
FieldError.displayName = "FieldError";

const FieldContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="field-content"
    className={cn("flex flex-col gap-1.5", className)}
    {...props}
  />
));
FieldContent.displayName = "FieldContent";

const FieldTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="field-title"
    className={cn("text-sm font-semibold text-foreground", className)}
    {...props}
  />
));
FieldTitle.displayName = "FieldTitle";

const FieldSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="field-separator"
    className={cn(
      "relative flex items-center justify-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground",
      className
    )}
    {...props}
  >
    <span className="absolute inset-x-0 h-px bg-border" aria-hidden />
    <span className="relative bg-background px-3">{props.children}</span>
  </div>
));
FieldSeparator.displayName = "FieldSeparator";

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
};

