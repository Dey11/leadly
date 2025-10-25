"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { clientApi } from "@/lib/client/api";
import { Button } from "@/components/ui/button";

type DeleteServiceButtonProps = {
  serviceId: string;
};

export function DeleteServiceButton({ serviceId }: DeleteServiceButtonProps) {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: () => clientApi.deleteService(serviceId),
    onSuccess: () => {
      router.refresh();
    },
  });

  const handleClick = () => {
    const confirmed = window.confirm(
      "Deleting this service will remove it permanently. Continue?"
    );
    if (!confirmed) return;

    mutation.mutate();
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      onClick={handleClick}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}

