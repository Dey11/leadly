import { NextResponse } from "next/server";

import { apiBaseUrl } from "@/lib/env";
import { applySessionCookieFromHeader } from "@/lib/server/session";

export async function POST(request: Request) {
  const { name, email, password } = await request.json();

  const backendResponse = await fetch(`${apiBaseUrl}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ name, email, password }),
    redirect: "manual",
  });

  const text = await backendResponse.text();
  let payload: Record<string, unknown> | null = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!backendResponse.ok) {
    const message =
      (payload &&
        typeof payload === "object" &&
        "error" in payload &&
        typeof (payload as Record<string, unknown>).error === "string" &&
        (payload as Record<string, string>).error) ||
      payload?.message ||
      backendResponse.statusText ||
      "Unable to create your account.";

    return NextResponse.json(
      { error: message },
      { status: backendResponse.status }
    );
  }

  await applySessionCookieFromHeader(
    backendResponse.headers.get("set-cookie")
  );

  return NextResponse.json(
    payload ?? { message: "Account created" },
    { status: 201 }
  );
}

