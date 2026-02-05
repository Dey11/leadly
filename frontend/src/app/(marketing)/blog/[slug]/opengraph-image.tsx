import { ImageResponse } from "next/og";
import { backendUrl } from "@/lib/env";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "Leadly Blog Post";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Font
// We can load specific fonts here if needed, but for now we'll use system fonts or default
// If we had a font file (e.g., Inter), we would fetchStr it here.

export default async function Image({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  // In a real scenario, we might fetch the actual title from the DB/API via the slug to be precise.
  // But often the slug is decipherable or we accept a slight trade-off if we don't want a heavy fetch in edge.
  // Let's try to fetch relevant details from our API if accessible effectively, or fallback to slug transformation.
  // For 'edge' runtime, fetch is available.

  let title = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Attempt to fetch real title for OG image.
  try {
    const res = await fetch(`${backendUrl}/api/v1/blog/posts/${slug}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.title) title = data.title;
    }
  } catch (e) {
    // Fallback to slug title
    console.error("OG Image fetch failed", e);
  }

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000000",
        backgroundImage:
          "radial-gradient(circle at 25% 0%, #4338ca 0%, transparent 20%), radial-gradient(circle at 75% 100%, #be185d 0%, transparent 20%)",
        fontFamily: "sans-serif",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Grid */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "80px",
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "40px",
            fontSize: "32px",
            fontWeight: "bold",
            letterSpacing: "-0.05em",
          }}
        >
          <span style={{ color: "#ffffff" }}>Leadly</span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            backgroundImage:
              "linear-gradient(to bottom right, #ffffff, #a5b4fc)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: "30px",
            maxWidth: "1000px",
          }}
        >
          {title}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "24px",
            color: "#a1a1aa",
            marginTop: "20px",
          }}
        >
          AI-Powered Lead Generation & Sales Intelligence
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
