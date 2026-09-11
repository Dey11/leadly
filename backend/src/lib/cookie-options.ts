import { env } from "../env";
import { resolveCookieDomain } from "./cookie-domain";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export function getCookieOptions(maxAge = SESSION_DURATION_MS) {
  const isProduction = env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    domain: resolveCookieDomain(
      env.FRONTEND_URL,
      env.NODE_ENV,
      env.COOKIE_DOMAIN,
    ),
    maxAge,
    path: "/",
  } as const;
}
