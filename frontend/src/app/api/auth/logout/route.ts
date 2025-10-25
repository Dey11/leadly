import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { apiBaseUrl } from "@/lib/env";
import { clearSessionCookie } from "@/lib/server/session";

export async function POST() {
  const store = await cookies();
  const sessionToken = store.get("session_token");

  try {
    await fetch(`${apiBaseUrl}/logout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Cookie: sessionToken ? `session_token=${sessionToken.value}` : "",
      },
    });
  } catch {
    // Ignore upstream network errors, still clear the local session cookie.
  }

  await clearSessionCookie();

  return NextResponse.json({ message: "Logged out" });
}
