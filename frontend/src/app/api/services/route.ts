import { NextResponse } from "next/server";

import { forwardBackendJson } from "@/lib/server/proxy";

export async function POST(request: Request) {
  const body = await request.json();
  return forwardBackendJson("/services", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

