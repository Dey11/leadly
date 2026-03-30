import { Metadata } from "next";
import { notFound } from "next/navigation";
import { alternativePages } from "@/data/commercial-pages";
import { siteConfig } from "@/config/site";
import { CommercialPageTemplate } from "@/components/landing/CommercialPage";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildProductSchema,
} from "@/lib/structured-data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return alternativePages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = alternativePages.find((entry) => entry.slug === slug);

  if (!page) {
    return { title: "Alternatives Not Found" };
  }

  const canonical = `${siteConfig.url}/alternatives/${page.slug}`;

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonical,
      images: [siteConfig.ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [siteConfig.ogImage],
    },
  };
}

export default async function AlternativesPage({ params }: Props) {
  const { slug } = await params;
  const page = alternativePages.find((entry) => entry.slug === slug);

  if (!page) {
    notFound();
  }

  const schemas = [
    buildBreadcrumbSchema(siteConfig.url, [
      { name: "Home", path: "/" },
      { name: "Alternatives", path: "/alternatives" },
      { name: page.title, path: `/alternatives/${page.slug}` },
    ]),
    buildFaqSchema(page.faqs),
    buildProductSchema(siteConfig.url),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <CommercialPageTemplate page={page} pageTypeLabel="Alternatives page" />
    </>
  );
}
