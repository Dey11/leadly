import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { siteConfig } from "@/config/site";
import { getAccountSummary } from "@/lib/backend-queries";

export const metadata: Metadata = {
  title: `Create account · ${siteConfig.name}`,
};

export default async function RegisterPage() {
  const account = await getAccountSummary();
  if (account) {
    redirect("/dashboard");
  }
  return <RegisterForm />;
}
