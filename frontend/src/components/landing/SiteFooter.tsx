"use client";

import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-border/40 bg-card/50 border-t px-4 py-8 sm:py-10">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
          {/* Logo & Description */}
          <div className="col-span-2 space-y-3 sm:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-lg font-bold tracking-tight"
            >
              <div className="relative size-6 sm:size-7">
                <Image
                  src="/assets/logo-mark.png"
                  alt="Leadly"
                  fill
                  className="object-contain"
                />
              </div>
              Leadly
            </Link>
            <p className="text-muted-foreground max-w-[220px] text-xs leading-relaxed sm:text-sm">
              Turn Reddit conversations into revenue with AI-powered lead
              monitoring.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-foreground text-xs font-semibold tracking-wide uppercase">
              Product
            </h4>
            <ul className="text-muted-foreground space-y-1 text-xs sm:space-y-1.5 sm:text-sm">
              <li>
                <Link
                  href="#how-it-works"
                  className="hover:text-foreground transition-colors"
                >
                  How it works
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
              <li>
                <Link
                  href="/login"
                  className="hover:text-foreground transition-colors"
                >
                  Log in
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-foreground text-xs font-semibold tracking-wide uppercase">
              Company
            </h4>
            <ul className="text-muted-foreground space-y-1 text-xs sm:space-y-1.5 sm:text-sm">
              <li>
                <a
                  href="mailto:hello@leadly.live"
                  className="hover:text-foreground transition-colors"
                >
                  Contact
                </a>
              </li>
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

          {/* Get Started */}
          <div className="border-border/30 col-span-2 space-y-2 border-t pt-4 sm:col-span-1 sm:space-y-3 sm:border-0 sm:pt-0">
            <h4 className="text-foreground text-xs font-semibold tracking-wide uppercase">
              Get Started
            </h4>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Start finding leads on Reddit today.
            </p>
            <Link
              href="/register"
              className="text-primary hover:text-primary/80 text-xs font-medium transition-colors sm:text-sm"
            >
              Sign up free →
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-border/40 text-muted-foreground mt-6 flex flex-col items-center justify-between gap-2 border-t pt-4 text-[10px] sm:mt-8 sm:flex-row sm:gap-3 sm:pt-6 sm:text-xs">
          <p>© 2025 Leadly Inc. All rights reserved.</p>
          <Link
            href="/cookies"
            className="hover:text-foreground transition-colors"
          >
            Cookie Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
