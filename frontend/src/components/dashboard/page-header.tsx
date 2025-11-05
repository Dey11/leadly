import type { ReactNode } from "react";

type DashboardPageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "left" | "center";
};

export function DashboardPageHeader({
  title,
  description,
  action,
  align = "left",
}: DashboardPageHeaderProps) {
  return (
    <header
      className={`flex flex-col gap-4 ${
        align === "center"
          ? "items-center text-center"
          : "items-start text-left"
      } sm:flex-row sm:items-start sm:justify-between sm:text-left`}
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 items-center">{action}</div> : null}
    </header>
  );
}
