"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp } from "lucide-react";
import { SUPPORT_EMAIL } from "@/constants/config";

export function SiteFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative">
      {/* Back to Top Button */}
      <div className="flex justify-center py-6">
        <button
          onClick={scrollToTop}
          className="group border-border/50 bg-card text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-foreground flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition-all"
        >
          <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
          Back to top
        </button>
      </div>

      {/* Footer Container - Full width with padding like Hero */}
      <div className="px-3 pb-3 sm:px-4 sm:pb-4 md:px-6 md:pb-6">
        <div className="relative mx-auto w-full overflow-hidden rounded-3xl sm:rounded-[2rem]">
          {/* Background Gradient - Similar to Hero but inverted/different */}
          <div className="pointer-events-none absolute inset-0">
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#faf8f7] to-[#f5ebe5] dark:from-[#18181b] dark:to-[#09090b]" />

            {/* Gradient blobs - positioned at top instead of bottom */}
            <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-[#773344]/20 blur-[80px] dark:bg-[#773344]/35" />
            <div className="absolute -top-20 left-1/3 h-[400px] w-[400px] rounded-full bg-[#e3b5a4]/40 blur-[80px] dark:bg-[#e3b5a4]/25" />
            <div className="absolute -top-40 right-1/4 h-[450px] w-[450px] rounded-full bg-[#d44d5c]/15 blur-[80px] dark:bg-[#d44d5c]/25" />
            <div className="absolute top-0 -right-20 h-[350px] w-[350px] rounded-full bg-[#bde0fe]/25 blur-[80px] dark:bg-[#60a5fa]/15" />

            {/* Grain overlay */}
            <div
              className="absolute inset-0 opacity-10 dark:opacity-5"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* CTA Section */}
            <div className="px-6 py-12 text-center sm:px-10 sm:py-16 md:py-20">
              <h2 className="font-display text-foreground mb-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
                Ready to turn Reddit into revenue?
              </h2>
              <p className="text-muted-foreground mx-auto mb-8 max-w-xl text-sm sm:text-base md:text-lg">
                Stop missing leads. Discover high-intent buyers on Reddit — all
                from one powerful dashboard.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Button
                  size="lg"
                  className="h-11 w-full px-8 text-sm font-semibold shadow-lg sm:h-12 sm:w-auto sm:px-10 sm:text-base"
                  asChild
                >
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border/60 dark:bg-card/80 dark:hover:bg-card h-11 w-full bg-white/80 px-8 text-sm font-semibold hover:bg-white sm:h-12 sm:w-auto sm:px-10 sm:text-base"
                  asChild
                >
                  <Link href="#how-it-works">Explore Features</Link>
                </Button>
              </div>
            </div>

            {/* Footer Links Section - Rounded inside container */}
            <div className="border-border/30 dark:bg-card/80 mx-4 mb-4 rounded-2xl border-t bg-white/80 px-6 py-8 backdrop-blur-sm sm:mx-6 sm:mb-6 sm:rounded-3xl sm:px-10 sm:py-10">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
                {/* Logo & Email Signup */}
                <div className="space-y-4 lg:col-span-2">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-lg font-bold tracking-tight"
                  >
                    <div className="relative size-6">
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
                    </div>
                    Leadly
                  </Link>
                  <p className="text-muted-foreground max-w-xs text-xs leading-relaxed sm:text-sm">
                    Receive product updates, feature launches, and lead
                    generation insights.
                  </p>
                  <form
                    className="flex max-w-sm gap-2"
                    onSubmit={(e) => e.preventDefault()}
                  >
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="border-border/50 dark:bg-card h-9 flex-1 bg-white text-sm"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="h-9 px-4 text-sm"
                    >
                      Submit
                    </Button>
                  </form>
                </div>

                {/* Product */}
                <div className="space-y-3">
                  <h4 className="text-foreground text-xs font-semibold tracking-wide sm:text-sm">
                    Product
                  </h4>
                  <ul className="text-muted-foreground space-y-2 text-xs sm:text-sm">
                    <li>
                      <Link
                        href="#how-it-works"
                        className="hover:text-foreground transition-colors"
                      >
                        Features
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#pricing"
                        className="hover:text-foreground transition-colors"
                      >
                        Pricing
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Company */}
                <div className="space-y-3">
                  <h4 className="text-foreground text-xs font-semibold tracking-wide sm:text-sm">
                    Company
                  </h4>
                  <ul className="text-muted-foreground space-y-2 text-xs sm:text-sm">
                    <li>
                      <Link
                        href="/about"
                        className="hover:text-foreground transition-colors"
                      >
                        About
                      </Link>
                    </li>
                    <li>
                      <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="hover:text-foreground transition-colors"
                      >
                        Contact
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Legal */}
                <div className="space-y-3">
                  <h4 className="text-foreground text-xs font-semibold tracking-wide sm:text-sm">
                    Legal
                  </h4>
                  <ul className="text-muted-foreground space-y-2 text-xs sm:text-sm">
                    <li>
                      <Link
                        href="/terms"
                        className="hover:text-foreground transition-colors"
                      >
                        Terms
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/privacy"
                        className="hover:text-foreground transition-colors"
                      >
                        Privacy
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Resources */}
                <div className="space-y-3">
                  <h4 className="text-foreground text-xs font-semibold tracking-wide sm:text-sm">
                    Resources
                  </h4>
                  <ul className="text-muted-foreground space-y-2 text-xs sm:text-sm">
                    <li>
                      <Link
                        href="/blog"
                        className="hover:text-foreground transition-colors"
                      >
                        Blog
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/help"
                        className="hover:text-foreground transition-colors"
                      >
                        Help
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Copyright */}
              <div className="border-border/30 text-muted-foreground mt-8 border-t pt-6 text-center text-xs">
                <p>
                  Copyright © {new Date().getFullYear()} Leadly Inc. All rights
                  reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
