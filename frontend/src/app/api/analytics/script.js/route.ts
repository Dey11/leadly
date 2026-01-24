import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://umami.cooldash.xyz/script.js", {
      headers: {
        "User-Agent": "Next.js Analytics Proxy",
      },
    });

    if (!response.ok) {
      return new NextResponse("Failed to fetch analytics script", {
        status: 502,
      });
    }

    let script = await response.text();

    // Replace the Umami endpoint with our proxy endpoint
    // This ensures tracking requests go to /api/send instead of /api/analytics/api/send
    script = script.replace(/(['"`])\/api\/send\1/g, "'/api/send'");

    return new NextResponse(script, {
      status: 200,
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "CDN-Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Error proxying analytics script:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
