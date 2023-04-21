"use client";
import React, { useState } from "react";

import { trpc } from "@/lib/trpc/hooks";
import { Switch } from "@/components/switch";
import { Label } from "@/components/label";
import { useToast, Toaster } from "@/components/toast";

type Props = {
  endpointId: string;
  active: boolean;
};

export const Toggle: React.FC<Props> = ({ endpointId, active }) => {
  const { addToast } = useToast();

  const [checked, setChecked] = useState(active);

  const toggle = trpc.endpoint.toggleActive.useMutation();
  return (
    <div className="flex items-center gap-2 ">
      <Toaster />
      <Label>{checked ? "Active" : "Disabled"}</Label>
      <Switch
        checked={checked}
        onClick={async () => {
          try {
            // optimistic update
            setChecked(!checked);
            const res = await toggle.mutateAsync({ endpointId });
            setChecked(res.active);
            addToast({
              title: "Success",
              content: `Endpoint ${res.active ? "activated" : "deactivated"}`,
            });
            // router.refresh();
          } catch (e) {
            addToast({
              title: "Error",
              content: (e as Error).message,
              variant: "error",
            });
          }
        }}
      />
    </div>
  );
};
