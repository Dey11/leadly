import type { Metadata } from "next";
import { Outfit, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { SEO_CONFIG } from "@/constants/seo";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CookieConsent } from "@/components/ui/cookie-consent";
import {
  UmamiScript,
  GoogleAnalytics,
} from "@/components/analytics/UmamiScript";
import NextTopLoader from "nextjs-toploader";

// Display font for headings
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

// Body font for general text
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

// Mono font for code
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: SEO_CONFIG.default.title,
    template: `%s · ${siteConfig.name}`,
  },
  description: SEO_CONFIG.default.description,
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: SEO_CONFIG.default.title,
    description: SEO_CONFIG.default.description,
    url: siteConfig.url,
    type: "website",
    siteName: siteConfig.name,
    locale: "en_US",
    images: [
      {
        url: SEO_CONFIG.default.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - AI-Powered Reddit Lead Generation Platform`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_CONFIG.default.title,
    description: SEO_CONFIG.default.description,
    creator: "@leadlylive",
    site: "@leadlylive",
    images: [SEO_CONFIG.default.ogImage],
  },
  authors: [{ name: siteConfig.author, url: siteConfig.url }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  keywords: SEO_CONFIG.default.keywords,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${dmSans.variable} ${jetbrainsMono.variable} bg-background text-foreground`}
      suppressHydrationWarning
    >
      <body
        className="bg-background font-body min-h-screen antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <NextTopLoader color="#734" />
            <UmamiScript />
            {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
              <GoogleAnalytics
                gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}
              />
            )}
            {children}
            <CookieConsent />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
