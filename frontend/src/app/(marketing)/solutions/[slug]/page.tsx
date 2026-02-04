import { Metadata } from "next";
import { notFound } from "next/navigation";
import solutionsData from "@/data/solutions.json";
import { siteConfig } from "@/config/site";

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
import { Pricing } from "@/components/landing/Pricing";
import { AnimatedDemo } from "@/components/landing/animated-demo";
import { LandingNav } from "@/components/landing/LandingNav";
import { SiteFooter } from "@/components/landing/SiteFooter";

import {
  MessageSquareOff,
  SearchX,
  TrendingDown,
  CheckCircle2,
  Filter,
  ScanLine,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

interface SolutionData {
  slug: string;
  title: string;
  description: string;
  role: string;
  pain_points: string[];
  value_props: string[];
  why_reddit: string;
  cta: string;
  image_keyword: string;
  faqs?: { question: string; answer: string }[];
  use_cases?: { title: string; description: string; pain?: string }[];
}

const pages: SolutionData[] = solutionsData as SolutionData[];

// Generate static params for SSG
export async function generateStaticParams() {
  return pages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = pages.find((p) => p.slug === slug);

  if (!page) {
    return { title: "Solution Not Found" };
  }

  return {
    title: `${page.title} | Leadly`,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      type: "website",
      images: [siteConfig.ogImage],
    },
  };
}

export default async function SolutionPage({ params }: Props) {
  const { slug } = await params;
  const page = pages.find((p) => p.slug === slug);

  if (!page) {
    notFound();
  }

  // Map pain points to Problem items
  const problemItems = page.pain_points.map((point, index) => ({
    // icon: will fallback to default in component
    title: `Challenge #${index + 1}`,
    description: point,
  }));

  // Map value props to Solution steps
  const solutionItems = page.value_props.map((prop, index) => ({
    // icon: will fallback to default in component
    title: `Step ${index + 1}`,
    description: prop,
  }));

  return (
    <div className="bg-background text-foreground selection:bg-primary/20 min-h-screen">
      {/* Floating Navbar (Copied from page.tsx structure) */}
      {/* Note: In a real app we might extract this Layout, but copying ensures 1:1 match as requested */}
      {/* We can potentially import a Shared Layout or just include the components here if they are self-contained */}
      {/* This page.tsx seems to include the header/footer directly in page.tsx of root :/ */}
      {/* I will replicate the Header structure here. */}

      <div className="fixed top-3 right-0 left-0 z-50 flex justify-center px-4 sm:top-7 sm:px-6 md:top-10 md:px-10 lg:px-12">
        <header className="bg-background/90 border-border/40 relative flex w-full max-w-5xl items-center justify-between rounded-full border py-2 pr-2 pl-4 shadow-lg backdrop-blur-xl sm:py-3 sm:pr-3 sm:pl-5 md:pr-4 md:pl-6">
          {/* Logo reuse can be tricky if not in a component, assuming standard Next Link */}
          <a
            href="/"
            className="text-foreground font-display flex shrink-0 items-center gap-1.5 text-sm font-medium transition hover:opacity-80 sm:gap-2 sm:text-base md:text-lg"
          >
            <span className="xs:inline">Leadly</span>
          </a>

          {/* Nav Links - Absolutely Centered */}
          <nav className="text-muted-foreground pointer-events-none absolute inset-0 hidden items-center justify-center gap-6 text-sm font-medium lg:flex lg:gap-8">
            {[
              { href: "/#how-it-works", label: "How it works" },
              { href: "/#use-cases", label: "Use cases" },
              { href: "/#pricing", label: "Pricing" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:text-foreground pointer-events-auto transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-1.5 sm:gap-2 md:gap-3">
            <LandingNav />
          </div>
        </header>
      </div>

      <main>
        {/* Dynamic Hero */}
        <Hero
          title={page.title}
          description={page.description}
          ctaText={page.cta}
        />
        <AnimatedDemo />
        <Features /> {/* Static */}
        <DualMonitoring />
        <ThreeSteps />
        {/* Dynamic Problem Section */}
        <Problem
          heading={`Why leads for ${page.role}s are hard to find`}
          subheading="Your ideal clients are asking for help, but traditional methods miss them."
          items={problemItems}
        />
        {/* Dynamic Solution Section */}
        <Solution
          heading="The Leadly Solution"
          subheading="How we help you connect with high-intent prospects."
          items={solutionItems}
        />
        <Competitors />
        <UseCases items={page.use_cases} />
        <BetaPerks />
        <Pricing />
        <FAQ items={page.faqs} />
        <TrustSafety />
      </main>

      <SiteFooter />
    </div>
  );
}
