import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Sign in · ${siteConfig.name}`,
};

export default function LoginPage() {
  return <LoginForm />;
}

