import { Metadata } from "next";
import Link from "next/link";
// import { db } from "@/lib/db"; // Removed direct DB access
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, User } from "lucide-react";
import { format } from "date-fns";
// import { BlogPost } from "@prisma/client"; // Removed direct DB import
import { LandingNav } from "@/components/landing/LandingNav";
import { SiteFooter } from "@/components/landing/SiteFooter";
import Image from "next/image";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  authorName: string | null;
  authorImage: string | null;
  publishedAt: Date | string | null;
  tags: string[];
}

export const metadata: Metadata = {
  title: "Leadly Blog - B2B Lead Generation Strategies",
  description:
    "Insights, strategies, and guides on how to generate high-quality B2B leads using Reddit and AI.",
};

async function getBlogPosts() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    // Force cache to be 'no-store' for dynamic, or 'force-cache' for SSG if built
    // For SSG during build, backend must be up.
    // If backend isn't up during build, this will fail unless we mock or skip.
    // For now, let's assume standard fetch with revalidation.
    const res = await fetch(
      `${apiUrl}/api/v1/blog/posts?status=PUBLISHED&limit=20`,
      {
        next: { revalidate: 3600 },
      },
    );

    if (!res.ok) {
      // Fallback or empty on error
      return [];
    }

    const data = await res.json();
    return data.posts || [];
  } catch (error) {
    console.error("Failed to fetch blog posts:", error);
    return [];
  }
}

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();

  return (
    <div className="bg-background text-foreground selection:bg-primary/20 min-h-screen">
      {/* Floating Navbar */}
      <div className="fixed top-3 right-0 left-0 z-50 flex justify-center px-4 sm:top-7 sm:px-6 md:top-10 md:px-10 lg:px-12">
        <header className="bg-background/90 border-border/40 relative flex w-full max-w-5xl items-center justify-between rounded-full border py-2 pr-2 pl-4 shadow-lg backdrop-blur-xl sm:py-3 sm:pr-3 sm:pl-5 md:pr-4 md:pl-6">
          <Link
            href="/"
            className="text-foreground font-display flex shrink-0 items-center gap-1.5 text-sm font-medium transition hover:opacity-80 sm:gap-2 sm:text-base md:text-lg"
          >
            <span className="relative size-5 sm:size-6 md:size-7 lg:size-8">
              <Image
                src="/assets/logo.svg"
                alt="Leadly"
                fill
                className="object-contain dark:hidden"
              />
              <Image
                src="/assets/logo-dark.svg"
                alt="Leadly"
                fill
                className="hidden object-contain dark:block"
              />
            </span>
            <span className="xs:inline hidden">Leadly</span>
          </Link>
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 md:gap-3">
            <LandingNav />
          </div>
        </header>
      </div>

      <main className="pt-32 pb-20">
        {/* Header Section */}
        <section className="relative px-6 py-12 text-center md:py-20">
          {/* Background Gradients (Similar to Hero) */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="bg-primary/5 absolute top-0 right-1/4 h-[400px] w-[400px] rounded-full blur-[80px]" />
            <div className="absolute top-20 left-1/4 h-[300px] w-[300px] rounded-full bg-indigo-500/10 blur-[80px]" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <h1 className="text-foreground font-display mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              The Leadly Blog
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg md:text-xl">
              Practical strategies for B2B lead generation, social selling, and
              finding your next customer on Reddit.
            </p>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="mx-auto max-w-7xl px-6 md:px-12">
          {posts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-muted-foreground text-lg">
                No posts yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post: BlogPost) => (
                <article
                  key={post.id}
                  className="group bg-card border-border/50 hover:border-primary/50 relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="bg-muted aspect-[16/9] overflow-hidden">
                    {post.coverImage && (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="h-full w-full transform object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="text-primary mb-3 flex items-center gap-3 text-xs font-medium">
                      {/* Show first valid tag that isn't internal junk */}
                      {(() => {
                        const validTag = post.tags.find(
                          (t) => t !== "AI_TECH_STACK" && !t.includes("_"),
                        );
                        return validTag ? (
                          <span className="tracking-wider uppercase">
                            {validTag}
                          </span>
                        ) : null;
                      })()}
                      <span className="bg-muted-foreground/30 h-1 w-1 rounded-full" />
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {post.publishedAt
                          ? format(new Date(post.publishedAt), "MMM d, yyyy")
                          : "Draft"}
                      </span>
                    </div>

                    <h2 className="text-card-foreground group-hover:text-primary mb-3 text-xl leading-snug font-semibold transition-colors">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="hover:underline focus:outline-none"
                      >
                        <span className="absolute inset-0 z-10" />
                        {post.title}
                      </Link>
                    </h2>

                    <p className="text-muted-foreground mb-6 line-clamp-3 flex-1 text-sm">
                      {post.excerpt}
                    </p>

                    <div className="border-border/30 mt-auto flex items-center justify-end border-t pt-4">
                      <span className="text-primary flex items-center gap-1 text-xs transition-transform group-hover:translate-x-1">
                        Read article <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
