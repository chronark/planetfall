"use client";

import React, { PropsWithChildren, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";

import { trpc } from "@/lib/trpc";
import { Loading } from "@/components/loading";
import { Button } from "@/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/dialog";

type Props = {
  keyId: string;
};
export const DeleteKeyButton: React.FC<PropsWithChildren<Props>> = ({ keyId, children }) => {
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();
  const router = useRouter();

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this API key? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="danger"
              disabled={loading}
              onClick={async () => {
                try {
                  setLoading(true);

                  await trpc.apikey.delete.mutate({ keyId });

                  router.refresh();
                  addToast({
                    title: "Key deleted",
                  });
                } catch (e) {
                  addToast({
                    title: "Error deleting key",
                    content: (e as Error).message,
                    variant: "error",
                  });
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? <Loading /> : "Delete Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
