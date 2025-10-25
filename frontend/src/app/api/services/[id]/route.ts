import { NextResponse } from "next/server";

import { forwardBackendJson } from "@/lib/server/proxy";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_: Request, context: Context) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Service id is required." }, { status: 400 });
  }

  return forwardBackendJson(`/services/${id}`, {
    method: "DELETE",
  });
}
