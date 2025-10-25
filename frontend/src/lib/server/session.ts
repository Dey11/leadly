import { cookies } from "next/headers";

type SessionCookie = {
  name: string;
  value: string;
  path: string;
  maxAge?: number;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
  httpOnly?: boolean;
};

export function parseSessionCookie(
  header: string | null
): SessionCookie | null {
  if (!header) return null;

  const sessionMatch = header.match(/session_token=([^;]+)/i);
  if (!sessionMatch) return null;

  const value = decodeURIComponent(sessionMatch[1]);
  const maxAge = header.match(/Max-Age=(\d+)/i);
  const path = header.match(/Path=([^;]+)/i);
  const sameSite = header.match(/SameSite=([^;]+)/i);
  const secure = /Secure/i.test(header);
  const httpOnly = /HttpOnly/i.test(header);

  return {
    name: "session_token",
    value,
    path: path ? path[1] : "/",
    maxAge: maxAge ? Number(maxAge[1]) : undefined,
    sameSite: (sameSite?.[1].toLowerCase() ??
      "lax") as SessionCookie["sameSite"],
    secure,
    httpOnly,
  };
}

export async function applySessionCookieFromHeader(header: string | null) {
  const parsed = parseSessionCookie(header);
  if (!parsed) return;

  const store = await cookies();
  store.set({
    name: parsed.name,
    value: parsed.value,
    path: parsed.path,
    maxAge: parsed.maxAge,
    sameSite: parsed.sameSite,
    secure: parsed.secure,
    httpOnly: parsed.httpOnly,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete("session_token");
}
