"use client";
import { Button } from "@/components/button";
import { Confirm } from "@/components/confirm";
import React from "react";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/hooks";

type Props = {
  endpointId: string;
  endpointName?: string;
  endpointUrl: string;
};

export const DeleteButton: React.FC<Props> = ({ endpointId, endpointName, endpointUrl }) => {
  const router = useRouter();
  const mutation = trpc.endpoint.delete.useMutation();
  return (
    <Confirm
      title="Delete endpoint?"
      description={endpointName ?? endpointUrl}
      trigger={<Button variant="danger">Delete</Button>}
      onConfirm={async () => {
        await mutation.mutateAsync({ endpointId });
        router.refresh();
      }}
    />
  );
};
