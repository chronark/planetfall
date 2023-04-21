"use client";
import { Button } from "@/components/button";
import { Loading } from "@/components/loading";
import { trpc } from "@/lib/trpc/hooks";
import { useState } from "react";

type Props = {
  teamId: string;
};

export const BillingButton: React.FC<Props> = (props): JSX.Element => {
  const [loading, setLoading] = useState(false);

  const portal = trpc.billing.portal.useMutation();
  return (
    <Button
      onClick={async () => {
        try {
          setLoading(true);

          const res = await portal.mutateAsync({
            teamId: props.teamId,
          });
          if (res.url) {
            /**
             * router.push was causing cors errors
             */
            window.location.href = res.url;
          }
        } catch (err) {
          alert((err as Error).message);
        } finally {
          setLoading(false);
        }
      }}
      disabled={loading}
      variant="link"
    >
      {loading ? <Loading /> : "Manage Billing and past Invoices"}
    </Button>
  );
};
