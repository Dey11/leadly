import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    const response = await fetch("https://umami.cooldash.xyz/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.headers.get("user-agent") || "Unknown",
      },
      body,
    });

    if (!response.ok) {
      return new NextResponse("Failed to send analytics", { status: 502 });
    }

    const data = await response.text();

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error proxying analytics send:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
