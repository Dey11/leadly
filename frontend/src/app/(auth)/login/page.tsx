import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { siteConfig } from "@/config/site";
import { getAccountSummary } from "@/lib/backend-queries";

export const metadata: Metadata = {
  title: `Sign in · ${siteConfig.name}`,
};

export default async function LoginPage() {
  const account = await getAccountSummary();
  if (account) {
    redirect("/dashboard");
  }
  return <LoginForm />;
}
