"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { clientApi } from "@/lib/client/api";
import { Button, type ButtonProps } from "@/components/ui/button";

type LogoutButtonProps = ButtonProps;

export function LogoutButton({ children, ...props }: LogoutButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => clientApi.logout(),
    onSuccess: () => {
      queryClient.clear();
      router.replace("/login");
      router.refresh();
    },
  });

  return (
    <Button
      {...props}
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending || props.disabled}
    >
      {mutation.isPending ? "Signing out..." : (children ?? "Sign out")}
    </Button>
  );
}
