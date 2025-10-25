import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Create account · ${siteConfig.name}`,
};

export default function RegisterPage() {
  return <RegisterForm />;
}

