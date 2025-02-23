import { BillingButton } from "./button";
import { UsageChart } from "./chart";
import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { Text } from "@/components/text";
import { auth } from "@clerk/nextjs/app-beta";
import { db } from "@planetfall/db";
import { getUsage } from "@planetfall/tinybird";
import Link from "next/link";
import { redirect } from "next/navigation";

export const revalidate = 10;

export default async function UsagePage(props: { params: { teamSlug: string } }) {
  const { userId } = auth();
  if (!userId) {
    return redirect("/auth/sign-in");
  }
  const team = await db.team.findUnique({
    where: { slug: props.params.teamSlug },
  });
  if (!team) {
    return redirect("/home");
  }

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const usage = await getUsage({
    teamId: team.id,
    year,
    month,
  });

  const totalUsage = usage.data.reduce((acc, cur) => acc + cur.usage, 0);
  const usagePercentage = (totalUsage / team.maxMonthlyRequests) * 100;

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Usage & Billing</CardTitle>
          <CardDescription>
            <Text>
              Current billing cycle:{" "}
              <strong>
                {new Date(year, month - 1, 1).toLocaleString(undefined, {
                  month: "long",
                })}{" "}
                {year}
              </strong>{" "}
            </Text>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex justify-around py-4 divide-x divide-zinc-200">
            <div className="flex flex-col w-1/2 gap-2 px-8">
              <Text size="xl">Current Usage</Text>
              <Text>
                {totalUsage.toLocaleString()} / {team.maxMonthlyRequests?.toLocaleString() ?? "∞"}{" "}
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
                {Math.max(0, totalUsage * 0.0001).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </Text>
            </div>
          </div>
          <div className="p-8">
            <div className="h-48">
              <UsageChart usage={usage.data} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-end gap-2">
          <BillingButton teamId={team.id} />
          <Link key="plans" href={`/${team.slug}/settings/plans`}>
            <Button variant="primary">Change your plan</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
