import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: {
    default: `Sign in · ${siteConfig.name}`,
    template: `%s · ${siteConfig.name}`,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden flex-1 bg-primary lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent opacity-90" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <div>
            <span className="inline-flex items-center rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
              Lead Intelligence
            </span>
            <h1 className="mt-6 max-w-md text-4xl font-semibold leading-tight">
              Understand your market by listening to the conversations that
              matter.
            </h1>
          </div>
          <p className="max-w-sm text-sm text-primary-foreground/80">
            Leadly tailors monitoring to your ICP, so you can reach out with the
            right message at the right time.
          </p>
        </div>
      </div>
      <div className="flex w-full flex-1 items-center justify-center bg-background/70 px-6 py-12 backdrop-blur-md sm:px-8 lg:max-w-xl">
        <div className="w-full max-w-md space-y-10">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold text-foreground">
              Welcome to {siteConfig.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitor communities. Spot intent. Close more deals.
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

