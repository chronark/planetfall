"use client";
import React from "react";
import {
  Button,
  Card,
  Text,
  CardContent,
  CardFooter,
  CardHeader,
  CardFooterActions,
  CardHeaderTitle,
} from "@/components/index";
import Link from "next/link";
import { PortalButton } from "./PortalButton";
import { Tag } from "@/components/tag";
import { BillingButton } from "./BillingButton";
import { Plan } from "@prisma/client";
import { DowngradeButton } from "./DowngradeButton";
import { UpgradeButton } from "./UpgradeButton";

type Props = {
  team: {
    id: string;
    plan: Plan;
    name: string;
    maxMonthlyRequests: number;
    trialExpires: Date | null;
    stripeCustomerId: string | null;
  };
  usage: number;
  usagePercentage: number;
  year: number;
  month: number;
};

export const UsageCard: React.FC<Props> = ({
  usagePercentage,
  team,
  usage,
  year,
  month,
}): JSX.Element => {
  return (
    <Card>
      <CardHeader>
        <CardHeaderTitle
          title="Usage"
          subtitle={
            <Text>
              Current billing cycle:{" "}
              <strong>
                {new Date(year, month - 1, 1).toLocaleString(undefined, {
                  month: "long",
                })}{" "}
                {year}
              </strong>{" "}
            </Text>
          }
        />
      </CardHeader>

      {/* actions={[
                  <Button
                    type="primary"
                    loading={checkout.isLoading}
                    key={"pro"}
                    disabled={!team}
                    onClick={handleCheckout}
                  >
                    {team?.stripeTrialExpires || team?.plan === "PERSONAL"
                      ? "Upgrade to PRO"
                      : "Change Plan"}
                  </Button>,
                ]} */}
      <CardContent>
        <div className="flex justify-around py-4 divide-x divide-zinc-200">
          <div className="flex flex-col w-1/2 gap-2 px-8">
            <Text size="xl">Current Usage</Text>
            <Text>
              {usage.toLocaleString()} / {team.maxMonthlyRequests?.toLocaleString() ?? "∞"}{" "}
              {usagePercentage !== null
                ? `(${usagePercentage.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}%)`
                : null}
            </Text>
            {usagePercentage !== null ? (
              <div className="overflow-hidden rounded-full bg-zinc-200">
                <div
                  className="h-2 rounded bg-primary-600"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            ) : null}
          </div>

          <div className="flex flex-col w-1/2 gap-2 px-8">
            <Text size="xl">Cost</Text>
            <Text>
              $
              {Math.max(0, (usage - 100000) * 0.0001).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </Text>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
