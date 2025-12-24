import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { siteConfig } from "@/config/site";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: `Sign in · ${siteConfig.name}`,
};

function resolveReturnUrl(value?: string) {
  if (!value) {
    return "/dashboard";
  }

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch (error) {
    console.warn("Failed to decode returnUrl", value, error);
  }

  if (decoded.startsWith("//")) {
    return "/dashboard";
  }
  if (!decoded.startsWith("/")) {
    return "/dashboard";
  }
  return decoded;
}

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const returnUrl = resolveReturnUrl(params.next);
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get("next_redirect")?.value;
  const returnFromCookie = resolveReturnUrl(cookieValue);
  const finalReturnUrl = returnUrl ?? returnFromCookie;
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <LoginForm returnUrl={finalReturnUrl} />
    </Suspense>
  );
}
