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

      {/* Floating Navbar */}
      <div className="fixed top-7 right-0 left-0 z-50 flex justify-center px-4 sm:top-10">
        <header className="bg-background/90 border-border/40 grid w-full max-w-5xl grid-cols-[auto_1fr_auto] items-center gap-6 rounded-full border py-3 pr-3 pl-6 shadow-lg backdrop-blur-xl">
          {/* Logo */}
          <Link
            href="/"
            className="text-foreground font-display flex shrink-0 items-center gap-2 text-base font-medium transition hover:opacity-80 sm:text-lg"
          >
            <span className="relative size-7 sm:size-8">
              <Image
                src="/assets/logo.svg"
                alt="Leadly"
                fill
                className="object-contain"
              />
            </span>
            <span>Leadly</span>
          </Link>

          {/* Nav Links - Centered */}
          <nav className="text-muted-foreground hidden items-center justify-center gap-8 text-sm font-medium lg:flex">
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

          {/* Actions (Login + Mode Toggle) */}
          <div className="flex items-center justify-end gap-3">
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
