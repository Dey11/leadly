import { env } from "../env";

/** Canonical public origin without a trailing slash. */
export const siteUrl = env.FRONTEND_URL.replace(/\/+$/, "");
