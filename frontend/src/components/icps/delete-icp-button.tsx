"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { clientApi } from "@/lib/client/api";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type DeleteIcpButtonProps = {
  icpId: string;
};

export function DeleteIcpButton({ icpId }: DeleteIcpButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: () => clientApi.deleteIcp(icpId),
    onSuccess: () => {
      router.refresh();
      setOpen(false);
    },
    onError: () => {
      setOpen(false);
    },
  });

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setOpen(true)}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Deleting..." : "Delete"}
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={(next) => {
          if (!mutation.isPending) {
            setOpen(next);
          }
        }}
        title="Delete this ICP?"
        description="Removing the ICP will also remove its configuration. You must recreate it to resume monitoring."
        confirmLabel="Delete ICP"
        tone="destructive"
        loading={mutation.isPending}
        onConfirm={() => mutation.mutate()}
      />
    </>
  );
}
