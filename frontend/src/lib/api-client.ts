import { cookies } from "next/headers";
import { apiBaseUrl } from "./env";

export class BackendError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "BackendError";
    this.status = status;
    this.payload = payload;
  }
}

export type BackendRequestInit = RequestInit & {
  skipAuth?: boolean;
};

function resolveUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (!path.startsWith("/")) {
    return `${apiBaseUrl}/${path}`;
  }
  return `${apiBaseUrl}${path}`;
}

export async function backendFetch(
  path: string,
  init?: BackendRequestInit,
): Promise<Response> {
  const url = resolveUrl(path);
  const headers = new Headers(init?.headers);
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session_token");

  headers.set("Accept", headers.get("Accept") ?? "application/json");
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!init?.skipAuth && sessionCookie) {
    const existingCookie = headers.get("cookie");
    const cookieValue = `session_token=${sessionCookie.value}`;
    headers.set(
      "cookie",
      existingCookie ? `${existingCookie}; ${cookieValue}` : cookieValue,
    );
  }

  const response = await fetch(url, {
    ...init,
    headers,
    cache: init?.cache ?? "no-store",
    credentials: init?.credentials ?? "include",
  });

  if (!response.ok) {
    let payload: unknown;
    try {
      payload = await response.clone().json();
    } catch {
      payload = await response.text();
    }
    let message = response.statusText || "Backend request failed";
    if (typeof payload === "object" && payload !== null && "error" in payload) {
      const errorMessage = (payload as Record<string, unknown>).error;
      if (typeof errorMessage === "string" && errorMessage.trim()) {
        message = errorMessage;
      }
    } else if (typeof payload === "string" && payload.trim()) {
      message = payload;
    }
    throw new BackendError(message, response.status, payload);
  }

  return response;
}

export async function backendJson<T>(
  path: string,
  init?: BackendRequestInit,
): Promise<T> {
  const response = await backendFetch(path, init);
  if (response.status === 204) {
    return null as T;
  }
  return (await response.json()) as T;
}
