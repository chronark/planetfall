"use client";

import { Button } from "@/components/button";
import { Loading } from "@/components/loading";
import { trpc } from "@/lib/trpc/hooks";
import { Plan } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/toast";
import { TRPCError } from "@trpc/server";

type Props = {
  teamId: string;
  plan: Plan;
};

export const CurrentButton: React.FC = (): JSX.Element => {
  return (
    <Button className="w-full" variant="disabled" disabled>
      Current Plan
    </Button>
  );
};

export const DowngradeButton: React.FC<Props> = ({ teamId, plan }): JSX.Element => {
  const router = useRouter();
  const { addToast } = useToast();

  const changePlan = trpc.billing.changePlan.useMutation({
    onError(error) {
      console.error(error);
      addToast({
        title: "Error",
        content: error.message,
        variant: "error",
      });
    },
    onSuccess() {
      router.refresh();
    },
  });

  return (
    <Button
      className="w-full"
      variant="secondary"
      onClick={() => changePlan.mutate({ teamId, plan: plan as any })}
    >
      {changePlan.isLoading ? <Loading /> : "Downgrade"}
    </Button>
  );
};

export const UpgradeButton: React.FC<Props> = ({ teamId, plan }): JSX.Element => {
  const router = useRouter();
  const { addToast } = useToast();

  const changePlan = trpc.billing.changePlan.useMutation({
    onError(error) {
      console.error(error);
      addToast({
        title: "Error",
        content: error.message,
        variant: "error",
      });
    },
    onSuccess() {
      router.refresh();
    },
  });

  return (
    <Button
      className="w-full"
      variant="primary"
      onClick={() =>
        changePlan.mutate({
          teamId,
          // @ts-ignore
          plan,
        })
      }
    >
      {changePlan.isLoading ? <Loading /> : "Upgrade"}
    </Button>
  );
};
export const ContactButton: React.FC = (): JSX.Element => {
  return (
    <Link href="mailto:support@planetfall.io">
      <Button className="w-full" variant="primary">
        Contact
      </Button>
    </Link>
  );
};
