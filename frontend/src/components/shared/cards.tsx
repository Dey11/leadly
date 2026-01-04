import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FadeInItem } from "@/components/shared/motion";

interface DashboardCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function DashboardCard({
  title,
  description,
  children,
  footer,
  className,
  action,
}: DashboardCardProps) {
  return (
    <FadeInItem className="h-full">
      <Card
        className={cn(
          "border-border/40 h-full shadow-sm transition-shadow duration-300 hover:shadow-md",
          className,
        )}
      >
        {(title || description || action) && (
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              {title && (
                <CardTitle className="text-base font-semibold">
                  {title}
                </CardTitle>
              )}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {action && <div>{action}</div>}
          </CardHeader>
        )}
        <CardContent>{children}</CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    </FadeInItem>
  );
}
