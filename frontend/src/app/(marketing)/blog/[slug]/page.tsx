import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Metadata } from "next";
import { LandingNav } from "@/components/landing/LandingNav";
import { SiteFooter } from "@/components/landing/SiteFooter";
import Image from "next/image";
import { ShareButtonClient } from "@/components/blog/ShareButtonClient";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { backendUrl } from "@/lib/env";

export const dynamicParams = true;
export const revalidate = 3600;

// --- Helper Functions ---

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

// --- Helper Components removed - TableOfContents is now a client component ---

// --- Data Fetching ---

export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${backendUrl}/api/v1/blog/posts?status=PUBLISHED&limit=1000`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.posts || []).map((post: { slug: string }) => ({
      slug: post.slug,
    }));
  } catch (error) {
    return [];
  }
}

async function getBlogPost(slug: string) {
  try {
    const res = await fetch(`${backendUrl}/api/v1/blog/posts/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || "",
      type: "article",
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || "",
    },
  };
}

// --- Main Page ---

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: postSlug } = await params;
  const post = await getBlogPost(postSlug);

  if (!post) notFound();

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Navbar Wrapper */}
      <div className="fixed top-3 right-0 left-0 z-50 flex justify-center px-4 sm:top-7 sm:px-6 md:top-10 md:px-10 lg:px-12">
        <header className="bg-background/90 border-border/40 relative flex w-full max-w-5xl items-center justify-between rounded-full border py-2 pr-2 pl-4 shadow-lg backdrop-blur-xl sm:py-3 sm:pr-3 sm:pl-5 md:pr-4 md:pl-6">
          <Link
            href="/"
            className="font-display flex items-center gap-2 font-medium"
          >
            <span className="relative h-6 w-6">
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
            <span>Leadly</span>
          </Link>
          <div className="flex items-center gap-2">
            <LandingNav />
          </div>
        </header>
      </div>

      <main className="mx-auto max-w-7xl px-6 pt-32 pb-20 md:pt-40">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          {/* Main Content Column */}
          <div className="lg:col-span-8">
            <Link
              href="/blog"
              className="text-muted-foreground hover:text-foreground group mb-8 inline-flex items-center text-sm transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Blog
            </Link>

            <header className="mb-10">
              <div className="mb-6 flex flex-wrap gap-1.5 sm:gap-2">
                {post.tags
                  .filter(
                    (t: string) => t !== "AI_TECH_STACK" && !t.includes("_"),
                  )
                  .map((tag: string) => (
                    <span
                      key={tag}
                      className="bg-primary/10 text-primary whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium sm:px-2.5 sm:py-1 sm:text-xs"
                    >
                      {tag}
                    </span>
                  ))}
              </div>

              <h1 className="text-foreground font-display mb-6 text-3xl leading-tight font-bold tracking-tight md:text-5xl">
                {post.title}
              </h1>

              <div className="border-border/40 flex items-center justify-between border-y py-4">
                <span className="text-muted-foreground text-sm">
                  {format(new Date(post.publishedAt), "MMMM d, yyyy")}
                </span>
                <ShareButtonClient
                  title={post.title}
                  url={`https://leadly.ai/blog/${post.slug}`}
                />
              </div>
            </header>

            {/* Featured Image */}
            {post.coverImage && (
              <div className="bg-muted border-border/10 relative mb-12 aspect-video w-full overflow-hidden rounded-2xl border">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <article className="prose prose-lg dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-headings:scroll-mt-32 max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ node, children, ...props }) => (
                    <h2 id={slugify(String(children))} {...props}>
                      {children}
                    </h2>
                  ),
                  h3: ({ node, children, ...props }) => (
                    <h3 id={slugify(String(children))} {...props}>
                      {children}
                    </h3>
                  ),
                  img: ({ node, src, alt, ...props }) => {
                    const imgSrc = typeof src === "string" ? src : "";
                    return (
                      <img
                        src={imgSrc}
                        alt={alt}
                        className="border-border/50 w-full rounded-xl border"
                        {...props}
                      />
                    );
                  },
                }}
              >
                {post.content}
              </ReactMarkdown>
            </article>
          </div>

          {/* Sidebar Column */}
          <aside className="hidden pl-8 lg:col-span-4 lg:block">
            <div className="sticky top-32 space-y-8">
              {/* Table of Contents */}
              <div className="bg-card/50 border-border/50 rounded-2xl border p-6 backdrop-blur-sm">
                <TableOfContents content={post.content} />
              </div>

              {/* CTA */}
              <div className="from-primary/5 to-primary/10 border-primary/20 rounded-2xl border bg-gradient-to-br p-6">
                <h3 className="text-foreground mb-2 text-lg font-bold">
                  Scale your Agency
                </h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Automate lead generation and close more deals with Leadly's AI
                  agents.
                </p>
                <Link href="/register">
                  <Button className="w-full">Start Free Trial</Button>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
