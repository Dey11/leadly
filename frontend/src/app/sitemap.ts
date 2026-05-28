import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { backendUrl } from "@/lib/env";

import solutionsData from "@/data/solutions.json";
import { comparePages, alternativePages } from "@/data/commercial-pages";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Programmatic Pages (Solutions)
  const solutionRoutes: MetadataRoute.Sitemap = solutionsData.map((page) => ({
    url: `${baseUrl}/solutions/${page.slug}`,
    lastModified: new Date(), // Could track this in json if needed
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const comparisonRoutes: MetadataRoute.Sitemap = comparePages.map((page) => ({
    url: `${baseUrl}/compare/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  const alternativeRoutes: MetadataRoute.Sitemap = alternativePages.map(
    (page) => ({
      url: `${baseUrl}/alternatives/${page.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.75,
    }),
  );

  // Dynamic Blog Posts
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(
      `${backendUrl}/api/v1/blog/posts?status=PUBLISHED&limit=1000`,
      {
        cache: "no-store",
      },
    );

    if (res.ok) {
      const data = await res.json();
      const posts = data.posts || [];

      blogRoutes = posts.map((post: { slug: string; updatedAt: string }) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: "weekly",
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error("Failed to fetch blog posts for sitemap:", error);
  }

  return [
    ...staticRoutes,
    ...solutionRoutes,
    ...comparisonRoutes,
    ...alternativeRoutes,
    ...blogRoutes,
  ];
}
