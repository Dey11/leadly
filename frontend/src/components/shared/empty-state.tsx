import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <Card
      className={`from-card/80 to-muted/30 border-border/60 flex flex-col items-center justify-center border-2 border-dashed bg-gradient-to-br px-6 py-12 ${className}`}
    >
      <div className="bg-primary/10 text-primary mb-4 flex h-14 w-14 items-center justify-center rounded-full">
        {icon}
      </div>
      <h3 className="text-center text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-sm text-center text-sm leading-relaxed">
        {description}
      </p>
      {action && (
        <Button asChild className="mt-5">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </Card>
  );
}
