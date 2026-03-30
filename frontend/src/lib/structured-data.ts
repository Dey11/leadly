type BreadcrumbItem = {
  name: string;
  path: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

export function buildBreadcrumbSchema(
  baseUrl: string,
  items: BreadcrumbItem[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
  };
}

export function buildFaqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildOrganizationSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Leadly",
    url: baseUrl,
    logo: `${baseUrl}/assets/og-image.png`,
    sameAs: [baseUrl],
  };
}

export function buildSoftwareApplicationSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Leadly",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: baseUrl,
    description:
      "Leadly helps SaaS founders and agencies find high-intent Reddit buying signals with AI lead scoring and keyword monitoring.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function buildProductSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Leadly",
    category: "Reddit lead generation software",
    description:
      "AI-powered Reddit lead generation software for SaaS founders and agencies.",
    brand: {
      "@type": "Brand",
      name: "Leadly",
    },
    url: baseUrl,
  };
}

export function buildArticleSchema(args: {
  baseUrl: string;
  slug: string;
  title: string;
  description: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  image?: string | null;
}) {
  const image = args.image?.startsWith("http")
    ? args.image
    : `${args.baseUrl}${args.image ?? "/assets/og-image.png"}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: args.title,
    description: args.description,
    datePublished: args.publishedAt,
    dateModified: args.updatedAt ?? args.publishedAt,
    author: {
      "@type": "Organization",
      name: "Leadly Editorial",
    },
    publisher: {
      "@type": "Organization",
      name: "Leadly",
      logo: {
        "@type": "ImageObject",
        url: `${args.baseUrl}/assets/og-image.png`,
      },
    },
    image,
    mainEntityOfPage: `${args.baseUrl}/blog/${args.slug}`,
  };
}
