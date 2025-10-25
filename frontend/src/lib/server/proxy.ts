import { NextResponse } from "next/server";

import {
  BackendError,
  backendFetch,
  type BackendRequestInit,
} from "@/lib/api-client";

function extractErrorMessage(payload: unknown, fallback: string) {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof (payload as Record<string, unknown>).error === "string"
  ) {
    return (payload as Record<string, string>).error;
  }

  if (typeof payload === "string" && payload.trim().length > 0) {
    return payload;
  }

  return fallback;
}

export async function forwardBackendJson(
  path: string,
  init: BackendRequestInit & { successStatus?: number } = {}
) {
  try {
    const response = await backendFetch(path, init);
    const successStatus = init.successStatus ?? response.status ?? 200;
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    return NextResponse.json(data, { status: successStatus });
  } catch (error) {
    if (error instanceof BackendError) {
      const message = extractErrorMessage(
        error.payload,
        error.message || "Request failed"
      );
      return NextResponse.json({ error: message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Unexpected error while communicating with the backend." },
      { status: 500 }
    );
  }
}

