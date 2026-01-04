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
      <div className="bg-primary relative hidden flex-1 lg:block">
        <div className="from-primary via-primary/90 to-accent absolute inset-0 bg-gradient-to-br opacity-90" />
        <div className="text-primary-foreground relative flex h-full flex-col justify-between p-12">
          <div>
            <span className="bg-primary-foreground/10 text-primary-foreground inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase">
              Lead Intelligence
            </span>
            <h1 className="mt-6 max-w-md text-4xl leading-tight font-semibold">
              Understand your market by listening to the conversations that
              matter.
            </h1>
          </div>
          <p className="text-primary-foreground/80 max-w-sm text-sm">
            Leadly tailors monitoring to your ICP, so you can reach out with the
            right message at the right time.
          </p>
        </div>
      </div>
      <div className="bg-background/70 flex w-full flex-1 items-center justify-center px-6 py-12 backdrop-blur-md sm:px-8 lg:max-w-xl">
        <div className="w-full max-w-md space-y-10">
          <div className="space-y-2 text-center">
            <h1 className="text-foreground text-2xl font-semibold">
              Welcome to {siteConfig.name}
            </h1>
            <p className="text-muted-foreground text-sm">
              Monitor communities. Spot intent. Close more deals.
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
