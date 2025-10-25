import { forwardBackendJson } from "@/lib/server/proxy";

export async function PATCH(request: Request) {
  const body = await request.json();
  return forwardBackendJson("/schedule", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
