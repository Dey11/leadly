"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { clientApi } from "@/lib/client/api";
import { Button } from "@/components/ui/button";

export function DeleteAccountButton() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => clientApi.deleteAccount(),
    onSuccess: () => {
      queryClient.clear();
      router.replace("/");
      router.refresh();
    },
  });

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Deleting your account will remove all monitors and services. This cannot be undone."
    );
    if (!confirmed) return;

    mutation.mutate();
  };

  return (
    <Button
      type="button"
      variant="ghost"
      className="text-destructive hover:text-destructive"
      onClick={handleDelete}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? "Deleting..." : "Delete account"}
    </Button>
  );
}
