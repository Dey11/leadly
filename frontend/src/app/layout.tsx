import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { QueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
  ],
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    type: "website",
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} Open Graph`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: "@leadly",
    images: [siteConfig.ogImage],
  },
  authors: [{ name: siteConfig.author }],
  keywords: [
    "lead generation",
    "B2B",
    "sales intelligence",
    "community monitoring",
    "Leadly",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background text-foreground">
      <body
        className="min-h-screen bg-background font-sans antialiased"
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
