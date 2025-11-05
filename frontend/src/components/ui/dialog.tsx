"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

type DialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

export function Dialog({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}: DialogProps) {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const currentOpen = isControlled ? open : internalOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  return (
    <DialogContext.Provider value={{ open: currentOpen, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

function useDialogContext(component: string) {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error(`${component} must be used within a Dialog`);
  }
  return context;
}

type DialogPortalProps = {
  children: React.ReactNode;
};

function DialogPortal({ children }: DialogPortalProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

type DialogTriggerProps = {
  asChild?: boolean;
  children: React.ReactElement;
};

export function DialogTrigger({ asChild, children }: DialogTriggerProps) {
  const { setOpen } = useDialogContext("DialogTrigger");
  const child = React.Children.only(children);
  const existingOnClick =
    (child.props as { onClick?: React.MouseEventHandler<HTMLElement> })
      ?.onClick;

  const trigger = React.cloneElement(child, {
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      existingOnClick?.(event);
      if (!event.defaultPrevented) {
        setOpen(true);
      }
    },
  } as Partial<typeof child.props>);

  return asChild ? trigger : <span>{trigger}</span>;
}

type DialogContentProps = {
  className?: string;
  children: React.ReactNode;
  overlayClassName?: string;
};

export function DialogContent({
  className,
  children,
  overlayClassName,
}: DialogContentProps) {
  const { open, setOpen } = useDialogContext("DialogContent");

  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <DialogPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
        <div
          className={cn(
            "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity",
            overlayClassName,
          )}
          onClick={() => setOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            "relative z-10 w-full max-w-3xl rounded-3xl border border-border/60 bg-card/95 shadow-2xl backdrop-blur",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </DialogPortal>
  );
}

type DialogCloseProps = {
  asChild?: boolean;
  children: React.ReactElement;
};

export function DialogClose({ asChild, children }: DialogCloseProps) {
  const { setOpen } = useDialogContext("DialogClose");
  const child = React.Children.only(children);
  const existingOnClick =
    (child.props as { onClick?: React.MouseEventHandler<HTMLElement> })
      ?.onClick;

  const closer = React.cloneElement(child, {
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      existingOnClick?.(event);
      if (!event.defaultPrevented) {
        setOpen(false);
      }
    },
  } as Partial<typeof child.props>);

  return asChild ? closer : <span>{closer}</span>;
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 border-b border-border/40 px-6 py-5",
        className,
      )}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-base font-semibold leading-none tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-border/40 px-6 py-5 sm:flex-row sm:items-center sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}
