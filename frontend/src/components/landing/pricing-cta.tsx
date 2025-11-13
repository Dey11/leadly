"use client";

import Link from "next/link";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";

const COOKIE_NAME = "next_redirect";
const COOKIE_MAX_AGE = 300; // 5 minutes

function setNextRedirectCookie(value: string) {
  if (!value) {
    return;
  }
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_MAX_AGE}`;
}

export type PricingCtaProps = {
  href: string;
  label: string;
  requiresAuth?: boolean;
  isAuthenticated: boolean;
  targetPath?: string;
};

export function PricingCta({
  href,
  label,
  requiresAuth,
  isAuthenticated,
  targetPath,
}: PricingCtaProps) {
  const handleClick = useCallback(() => {
    if (requiresAuth && !isAuthenticated) {
      setNextRedirectCookie(targetPath ?? href);
    }
  }, [href, isAuthenticated, requiresAuth, targetPath]);

  return (
    <Button asChild className="w-full">
      <Link href={href} onClick={handleClick}>
        {label}
      </Link>
    </Button>
  );
}
