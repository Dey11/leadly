import Link from "next/link";

export const metadata = {
  title: "Reset password · Leadly",
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-8 rounded-2xl border border-border bg-card/60 p-8 shadow-sm backdrop-blur">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Reset password
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We are putting the finishing touches on self-serve password resets.
          Until then, contact{" "}
          <a
            className="font-medium text-primary transition hover:text-primary/80"
            href="mailto:hello@leadly.live"
          >
            hello@leadly.live
          </a>{" "}
          and we will help you regain access within 24 hours.
        </p>
      </div>
      <div className="rounded-xl bg-secondary/40 p-4 text-sm text-secondary-foreground">
        <p className="font-medium">Need instant access?</p>
        <p className="mt-1 leading-relaxed">
          Use your Slack SSO during onboarding and you will never have to worry
          about passwords again.
        </p>
      </div>
      <Link
        href="/login"
        className="inline-flex items-center text-sm font-medium text-primary transition hover:text-primary/80"
      >
        Back to sign in
      </Link>
    </div>
  );
}

