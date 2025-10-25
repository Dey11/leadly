import { forwardBackendJson } from "@/lib/server/proxy";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.search;
  const path = search ? `/leads${search}` : "/leads";
  return forwardBackendJson(path);
}
