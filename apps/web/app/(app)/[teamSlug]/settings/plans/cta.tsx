"use client";

import { Button } from "@/components/button";
import { Loading } from "@/components/loading";
import { trpc } from "@/lib/utils/trpc";
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
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const onClick = async () => {
    try {
      setIsLoading(true);
      await trpc.billing.changePlan.mutate({
        teamId,
        // @ts-ignore
        plan,
      });
      router.refresh();
    } catch (error) {
      console.error(error);
      addToast({
        title: "Error",
        content: (error as TRPCError).message,
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Button className="w-full" variant="secondary" onClick={onClick}>
      {isLoading ? <Loading /> : "Downgrade"}
    </Button>
  );
};

export const UpgradeButton: React.FC<Props> = ({ teamId, plan }): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const onClick = async () => {
    try {
      setIsLoading(true);
      await trpc.billing.changePlan.mutate({
        teamId,
        // @ts-ignore
        plan,
      });
      router.refresh();
    } catch (error) {
      console.error(error);
      addToast({
        title: "Error",
        content: (error as TRPCError).message,
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Button className="w-full" variant="primary" onClick={onClick}>
      {isLoading ? <Loading /> : "Upgrade"}
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
