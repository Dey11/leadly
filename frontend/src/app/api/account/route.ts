import { NextResponse } from "next/server";

import { forwardBackendJson } from "@/lib/server/proxy";
import { clearSessionCookie } from "@/lib/server/session";

export async function PATCH(request: Request) {
  const body = await request.json();
  return forwardBackendJson("/account", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function DELETE() {
  const response = await forwardBackendJson("/account", {
    method: "DELETE",
  });

  if (response.status === 200) {
    await clearSessionCookie();
  }

  return response;
}

