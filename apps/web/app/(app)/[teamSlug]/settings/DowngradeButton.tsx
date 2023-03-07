"use client";
import { Button } from "@/components/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/dialog";
import { Loading } from "@/components/loading";
import { Tag } from "@/components/tag";
import { Plan } from "@prisma/client";
import { trpc } from "lib/utils/trpc";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  team: {
    id: string;
    name: string;
    plan: Plan;
  };
};

export const DowngradeButton: React.FC<Props> = ({ team }): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const next = team.plan === "PRO" ? "FREE" : team.plan === "ENTERPRISE" ? "PRO" : "FREE";
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Downgrade</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Downgrade {team.name} to <Tag>{next}</Tag>
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
