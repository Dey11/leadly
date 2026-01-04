import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { SEO_CONFIG } from "@/constants/seo";
import { getAccountSummary } from "@/lib/backend-queries";

export const metadata: Metadata = {
  title: SEO_CONFIG.auth.register.title,
  description: SEO_CONFIG.auth.register.description,
};

export default async function RegisterPage() {
  const account = await getAccountSummary();
  if (account) {
    redirect("/dashboard");
  }
  return <RegisterForm />;
}
