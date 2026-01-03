"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const navLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#use-cases", label: "Use cases" },
  { href: "#pricing", label: "Pricing" },
];

export function LandingNav() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`,
          {
            credentials: "include",
          },
        );
        setIsAuthenticated(res.ok);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const signInHref = isAuthenticated ? "/dashboard" : "/login";

  return (
    <>
      {/* Desktop nav */}
      <div className="hidden items-center gap-6 md:flex">
        <ModeToggle />
        <Button
          variant="outline"
          asChild
          className="rounded-full px-5 text-sm font-medium"
        >
          <Link href={signInHref}>
            {isLoading ? "Login" : isAuthenticated ? "Dashboard" : "Login"}
          </Link>
        </Button>
      </div>

      {/* Mobile nav toggle */}
      <div className="flex items-center gap-2 md:hidden">
        <ModeToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="size-9"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-background/95 border-border/40 absolute top-full right-4 left-4 mt-2 overflow-hidden rounded-3xl border backdrop-blur-lg md:hidden"
          >
            <nav className="container mx-auto flex flex-col items-center gap-2 px-4 py-4">
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted/50 w-full rounded-lg px-4 py-3 text-center text-sm font-medium transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <div className="border-border/40 mt-2 flex w-full flex-col items-center gap-2 border-t pt-4">
                <Button
                  variant="ghost"
                  asChild
                  className="w-full max-w-xs justify-center text-sm font-medium"
                >
                  <Link
                    href={signInHref}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {isLoading
                      ? "Sign in"
                      : isAuthenticated
                        ? "Dashboard"
                        : "Sign in"}
                  </Link>
                </Button>
                <Button asChild className="w-full max-w-xs text-sm font-medium">
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Start free
                  </Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
