"use client";
import { Button } from "@/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/dialog";
import { Loading } from "@/components/loading";
import { Tag } from "@/components/tag";
import { trpc } from "@/lib/trpc";
import type { Plan } from "@planetfall/db";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  team: {
    id: string;
    name: string;
    plan: Plan;
  };
};

export const UpgradeButton: React.FC<Props> = ({ team }): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const next = team.plan === "FREE" ? "PRO" : team.plan === "PRO" ? "ENTERPRISE" : "FREE";
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Upgrade</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Upgrade {team.name} to <Tag>{next}</Tag>
          </DialogTitle>
          <DialogDescription>
            <Button
              onClick={async () => {
                setLoading(true);
                await trpc.billing.changePlan.mutate({
                  teamId: team.id,
                  plan: next,
                });
                setLoading(false);
                router.refresh();
              }}
              disabled={loading}
            >
              {loading ? <Loading /> : next}
            </Button>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
