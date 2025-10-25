import { forwardBackendJson } from "@/lib/server/proxy";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, context: Context) {
  const { id } = await context.params;
  const body = await request.json();

  return forwardBackendJson(`/monitors/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function DELETE(_: Request, context: Context) {
  const { id } = await context.params;

  return forwardBackendJson(`/monitors/${id}`, {
    method: "DELETE",
  });
}
