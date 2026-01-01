import { Metadata } from "next";
import { SEO_CONFIG } from "@/constants/seo";
import { VerifyEmailContent } from "@/components/auth/verify-email-content";

export const metadata: Metadata = {
  title: SEO_CONFIG.auth.verifyEmail.title,
  description: SEO_CONFIG.auth.verifyEmail.description,
};

export default function VerifyEmailPage() {
  return <VerifyEmailContent />;
}
