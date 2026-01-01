import { Metadata } from "next";
import { SEO_CONFIG } from "@/constants/seo";
import { ResetPasswordContent } from "@/components/auth/reset-password-content";

export const metadata: Metadata = {
  title: SEO_CONFIG.auth.resetPassword.title,
  description: SEO_CONFIG.auth.resetPassword.description,
};

export default function ResetPasswordPage() {
  return <ResetPasswordContent />;
}
