import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { CommercialPage } from "@/data/commercial-pages";
import { LandingNav } from "@/components/landing/LandingNav";
import { SiteFooter } from "@/components/landing/SiteFooter";

export function CommercialPageTemplate({
  page,
  pageTypeLabel,
}: {
  page: CommercialPage;
  pageTypeLabel: string;
}) {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="fixed top-3 right-0 left-0 z-50 flex justify-center px-4 sm:top-7 sm:px-6 md:top-10 md:px-10 lg:px-12">
        <header className="bg-background/90 border-border/40 relative flex w-full max-w-5xl items-center justify-between rounded-full border py-2 pr-2 pl-4 shadow-lg backdrop-blur-xl sm:py-3 sm:pr-3 sm:pl-5 md:pr-4 md:pl-6">
          <Link
            href="/"
            className="font-display flex items-center gap-2 text-sm font-semibold sm:text-base"
          >
            Leadly
          </Link>
          <LandingNav />
        </header>
      </div>

      <main className="px-4 pt-28 pb-20 sm:px-6 md:px-10">
        <section className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div className="space-y-8">
            <div className="space-y-5">
              <p className="text-primary text-xs font-semibold tracking-[0.25em] uppercase">
                {page.eyebrow}
              </p>
              <h1 className="font-display max-w-4xl text-4xl leading-none font-bold tracking-tight sm:text-5xl md:text-6xl">
                {page.title}
              </h1>
              <p className="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
                {page.description}
              </p>
            </div>

            <div className="grid gap-4 border-y border-dashed py-6 sm:grid-cols-3">
              {page.bestFor.map((item) => (
                <div key={item} className="space-y-2">
                  <p className="text-xs font-semibold tracking-[0.18em] uppercase">
                    Best for
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-5">
              {page.sections.map((section) => (
                <div
                  key={section.title}
                  className="border-border/60 rounded-3xl border bg-white/70 p-6 dark:bg-white/5"
                >
                  <h2 className="font-display text-2xl font-semibold tracking-tight">
                    {section.title}
                  </h2>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed sm:text-base">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-4xl border border-dashed p-6 sm:p-8">
              <p className="text-xs font-semibold tracking-[0.24em] uppercase">
                Verdict
              </p>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed sm:text-xl">
                {page.verdict}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="rounded-full px-6">
                  <Link href={page.ctaHref}>{page.ctaLabel}</Link>
                </Button>
                <Button variant="outline" asChild className="rounded-full px-6">
                  <Link href="/blog">Read related guides</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:pt-16">
            <div className="border-border/60 bg-card/60 rounded-4xl border p-6 shadow-sm backdrop-blur-sm sm:p-8">
              <div className="grid gap-4">
                <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-3 border-b pb-3 text-[11px] font-semibold tracking-[0.2em] uppercase">
                  <span>Comparison</span>
                  <span>Leadly</span>
                  <span>{page.competitorLabel}</span>
                </div>
                {page.comparisonRows.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[1.1fr_1fr_1fr] gap-3 border-b border-dashed py-3 last:border-none"
                  >
                    <p className="text-sm font-semibold">{row.label}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {row.leadly}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {row.competitor}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-border/60 bg-card/60 rounded-4xl border p-6 shadow-sm backdrop-blur-sm sm:p-8">
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Frequently asked questions
              </h2>
              <div className="mt-6 space-y-5">
                {page.faqs.map((faq) => (
                  <div
                    key={faq.question}
                    className="border-b pb-4 last:border-none"
                  >
                    <h3 className="text-sm font-semibold sm:text-base">
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-primary/20 bg-primary/5 rounded-4xl border p-6 sm:p-8">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase">
                {pageTypeLabel}
              </p>
              <h2 className="font-display mt-4 text-2xl font-semibold tracking-tight">
                Build a cleaner Reddit acquisition workflow
              </h2>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                Use Leadly to monitor relevant subreddits, spot alternative and
                recommendation requests, and prioritize the conversations most
                likely to convert.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
