const rawBackendUrl =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:3001";

function normalizeUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export const backendUrl = normalizeUrl(rawBackendUrl);

export const apiBaseUrl = `${backendUrl}/api/v1`;
