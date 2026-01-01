import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { siteConfig } from "@/config/site";
import { SEO_CONFIG } from "@/constants/seo";
import { cookies } from "next/headers";
import { getAccountSummary } from "@/lib/backend-queries";

export const metadata: Metadata = {
  title: SEO_CONFIG.auth.login.title,
  description: SEO_CONFIG.auth.login.description,
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
  // Check auth first
  const account = await getAccountSummary();
  if (account) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const returnUrl = resolveReturnUrl(params.next);
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get("next_redirect")?.value;
  const returnFromCookie = resolveReturnUrl(cookieValue);
  const finalReturnUrl = returnUrl ?? returnFromCookie;
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="border-primary mb-4 h-8 w-8 animate-spin rounded-full border-b-2" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <LoginForm returnUrl={finalReturnUrl} />
    </Suspense>
  );
}
