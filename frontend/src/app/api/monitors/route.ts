import { forwardBackendJson } from "@/lib/server/proxy";

export async function POST(request: Request) {
  const body = await request.json();
  return forwardBackendJson("/monitors", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

