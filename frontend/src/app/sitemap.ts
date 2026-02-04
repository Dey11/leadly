import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

import solutionsData from "@/data/solutions.json";

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
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
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

  // Dynamic Blog Posts
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    // Fetch all posts for sitemap (limit 1000 or paginate if needed)
    const res = await fetch(
      `${apiUrl}/api/v1/blog/posts?status=PUBLISHED&limit=100`,
      {
        next: { revalidate: 3600 },
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

  return [...staticRoutes, ...solutionRoutes, ...blogRoutes];
}
