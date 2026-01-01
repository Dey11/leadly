import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { SEO_CONFIG } from "@/constants/seo";

// Landing Components
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { ThreeSteps } from "@/components/landing/ThreeSteps";
import { Problem } from "@/components/landing/Problem";
import { Solution } from "@/components/landing/Solution";
import { Competitors } from "@/components/landing/Competitors";
import { ProductPreview } from "@/components/landing/ProductPreview";
import { UseCases } from "@/components/landing/UseCases";
import { BetaPerks } from "@/components/landing/BetaPerks";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { TrustSafety } from "@/components/landing/TrustSafety";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingNav } from "@/components/landing/LandingNav";
import { SiteFooter } from "@/components/landing/SiteFooter";

export const metadata: Metadata = {
  title: SEO_CONFIG.landing.main.title,
  description: SEO_CONFIG.landing.main.description,
  openGraph: {
    title: SEO_CONFIG.landing.main.title,
    description: SEO_CONFIG.landing.main.description,
    images: [SEO_CONFIG.default.ogImage],
  },
};

const navLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#use-cases", label: "Use cases" },
  { href: "#pricing", label: "Pricing" },
];

export default function HomePage() {
  return (
    <div className="bg-background text-foreground selection:bg-primary/20 min-h-screen">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Leadly",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: siteConfig.url,
            description:
              "AI-powered Reddit monitoring for B2B lead generation.",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }),
        }}
      />

      {/* Header */}
      <div className="border-border/40 bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-xl">
        <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 text-sm md:px-8">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-foreground font-display flex shrink-0 items-center gap-2 text-lg font-bold transition hover:opacity-80"
            >
              <span className="relative mr-1 size-8">
                <Image
                  src="/assets/logo-mark.png"
                  alt="Leadly"
                  fill
                  className="object-contain"
                />
              </span>
              Leadly
            </Link>
          </div>

          {/* Center: Nav Links - Absolutely positioned */}
          <nav className="text-muted-foreground absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 font-medium md:flex">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:text-foreground transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <LandingNav />
          </div>
        </header>
      </div>

      <main>
        <Hero />
        <Features />
        <ThreeSteps />
        <Problem />
        <Solution />
        <Competitors />
        <ProductPreview />
        <UseCases />
        <BetaPerks />
        <Pricing />
        <FAQ />
        <TrustSafety />
        <FinalCTA />
      </main>

      <SiteFooter />
    </div>
  );
}
