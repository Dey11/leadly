import { forwardBackendJson } from "@/lib/server/proxy";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, context: Context) {
  const { id } = await context.params;
  return forwardBackendJson(`/leads/${id}`);
}

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;
  const body = await request.json();

  return forwardBackendJson(`/leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function DELETE(_: Request, context: Context) {
  const { id } = await context.params;
  return forwardBackendJson(`/leads/${id}`, {
    method: "DELETE",
  });
}

