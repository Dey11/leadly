import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { SEO_CONFIG } from "@/constants/seo";
import {
  buildOrganizationSchema,
  buildProductSchema,
  buildSoftwareApplicationSchema,
} from "@/lib/structured-data";

// Landing Components
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { DualMonitoring } from "@/components/landing/DualMonitoring";
import { ThreeSteps } from "@/components/landing/ThreeSteps";
import { Problem } from "@/components/landing/Problem";
import { Solution } from "@/components/landing/Solution";
import { Competitors } from "@/components/landing/Competitors";
import { UseCases } from "@/components/landing/UseCases";
import { BetaPerks } from "@/components/landing/BetaPerks";
import { FAQ } from "@/components/landing/FAQ";
import { TrustSafety } from "@/components/landing/TrustSafety";
import { LandingNav } from "@/components/landing/LandingNav";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { Pricing } from "@/components/landing/Pricing";
import { AnimatedDemo } from "@/components/landing/animated-demo";

export const metadata: Metadata = {
  title: SEO_CONFIG.landing.main.title,
  description: SEO_CONFIG.landing.main.description,
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: SEO_CONFIG.landing.main.title,
    description: SEO_CONFIG.landing.main.description,
    url: siteConfig.url,
    images: [SEO_CONFIG.default.ogImage],
  },
};

const navLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#use-cases", label: "Use cases" },
  { href: "#pricing", label: "Pricing" },
];

export default function HomePage() {
  const homepageSchemas = [
    buildSoftwareApplicationSchema(siteConfig.url),
    buildOrganizationSchema(siteConfig.url),
    buildProductSchema(siteConfig.url),
  ];

  return (
    <div className="bg-background text-foreground selection:bg-primary/20 min-h-screen">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homepageSchemas),
        }}
      />

      {/* Floating Navbar */}
      <div className="fixed top-3 right-0 left-0 z-50 flex justify-center px-4 sm:top-7 sm:px-6 md:top-10 md:px-10 lg:px-12">
        <header className="bg-background/90 border-border/40 relative flex w-full max-w-5xl items-center justify-between rounded-full border py-2 pr-2 pl-4 shadow-lg backdrop-blur-xl sm:py-3 sm:pr-3 sm:pl-5 md:pr-4 md:pl-6">
          {/* Logo */}
          <Link
            href="/"
            className="text-foreground font-display flex shrink-0 items-center gap-1.5 text-sm font-medium transition hover:opacity-80 sm:gap-2 sm:text-base md:text-lg"
          >
            <span className="relative size-5 sm:size-6 md:size-7 lg:size-8">
              <Image
                src="/assets/logo.svg"
                alt="Leadly"
                fill
                className="object-contain dark:hidden"
              />
              <Image
                src="/assets/logo-dark.svg"
                alt="Leadly"
                fill
                className="hidden object-contain dark:block"
              />
            </span>
            <span className="xs:inline hidden">Leadly</span>
          </Link>

          {/* Nav Links - Absolutely Centered */}
          <nav className="text-muted-foreground pointer-events-none absolute inset-0 hidden items-center justify-center gap-6 text-sm font-medium lg:flex lg:gap-8">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:text-foreground pointer-events-auto transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions (Login + Mode Toggle) */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 md:gap-3">
            <LandingNav />
          </div>
        </header>
      </div>

      <main>
        <Hero />
        <AnimatedDemo />
        <Features />
        <DualMonitoring />
        <ThreeSteps />
        <Problem />
        <Solution />
        <Competitors />
        <UseCases />
        <BetaPerks />
        <Pricing />
        <FAQ />
        <TrustSafety />
      </main>

      <SiteFooter />
    </div>
  );
}
