import { Metadata } from "next";
import { SEO_CONFIG } from "@/constants/seo";
import { ForgotPasswordContent } from "@/components/auth/forgot-password-content";

export const metadata: Metadata = {
  title: SEO_CONFIG.auth.forgotPassword.title,
  description: SEO_CONFIG.auth.forgotPassword.description,
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordContent />;
}
