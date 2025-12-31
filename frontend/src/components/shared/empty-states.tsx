import { LucideIcon, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "./cards";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <DashboardCard className={className}>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-muted mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <Icon className="text-muted-foreground h-6 w-6" />
        </div>
        <h3 className="text-foreground mb-2 text-lg font-medium">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-sm text-sm leading-relaxed">
          {description}
        </p>
        <Button onClick={onAction} variant="outline" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          {actionLabel}
        </Button>
      </div>
    </DashboardCard>
  );
}
