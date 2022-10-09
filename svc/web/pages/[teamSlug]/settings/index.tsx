import { Layout } from "../../../components/app/layout/nav";

import React from "react";
import { useRouter } from "next/router";

import { trpc } from "../../../lib/hooks/trpc";
import { Button, Card, Confirm, PageHeader, Text } from "components";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const teamSlug = router.query.teamSlug as string;
  // router.push(router.asPath + "/endpoints");
  const team = trpc.team.get.useQuery({ teamSlug }, { enabled: !!teamSlug });

  const ctx = trpc.useContext();
  const checkout = trpc.billing.checkout.useMutation({
    onSettled: () => ctx.team.get.invalidate(),
  });
  const cancel = trpc.billing.cancel.useMutation();

  const usage = trpc.billing.usage.useQuery({ teamId: team.data?.id ?? "" }, {
    enabled: !!team.data?.id,
  });

  const protocol = process.env.NEXT_PUBLIC_VERCEL_ENV ? "https" : "http";
  const host = process.env.NEXT_PUBLIC_VERCEL_ENV
    ? "planetfall.io"
    : "localhost:3000";

  async function handleCheckout(plan: "PRO" | "PERSONAL") {
    const { url } = await checkout.mutateAsync({
      teamId: team.data!.id,
      returnUrl: `${protocol}://${host}/${router.asPath}`,
      plan,
    });
    if (url) {
      router.push(url);
    }
  }

  const currentUsage = usage.data?.usage ?? 0;
  const maxUsage = team.data?.maxMonthlyRequests ?? null;
  const usagePercentage = maxUsage ? currentUsage / maxUsage * 100 : null;
  return (
    <Layout breadcrumbs={[]}>
      {/* <PageHeader title="Settings" /> */}

      <Card>
        <Card.Header>
          <Card.Header.Title
            title="Billing"
            subtitle={
              <Text>
                You are currently on the{" "}
                <span className="border border-slate-300 rounded px-1 bg-slate-50">
                  {team.data?.plan}
                </span>{" "}
                plan.
              </Text>
            }
          />
        </Card.Header>

        {
          /* actions={[
            <Button
              type="primary"
              loading={checkout.isLoading}
              key={"pro"}
              disabled={!team.data}
              onClick={handleCheckout}
            >
              {team.data?.stripeTrialExpires || team.data?.plan === "PERSONAL"
                ? "Upgrade to PRO"
                : "Change Plan"}
            </Button>,
          ]} */
        }
        <Card.Content>
          <div className="flex justify-around divide-x divide-slate-200">
            <div className="px-8 w-1/3 flex flex-col gap-2">
              <Text size="xl">Current Usage</Text>
              <Text>
                {currentUsage.toLocaleString()} /{" "}
                {maxUsage?.toLocaleString() ?? "∞"} {usagePercentage !== null
                  ? `(${
                    usagePercentage.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })
                  }%)`
                  : null}
              </Text>
              {usagePercentage !== null
                ? (
                  <div className="overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded bg-primary-600"
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                )
                : null}
            </div>

            <div className="px-8 w-1/3 flex flex-col gap-2">
              <Text size="xl">Cost</Text>
              <Text>
                ${team.data?.plan === "PRO" ? 20 : 0 +
                  (Math.max(0, currentUsage - 100000) * 0.0001)
                    .toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </Text>
            </div>
            <div className="px-8 w-1/3 flex flex-col gap-2">
              <Text size="xl">Current Billing Cycle</Text>
              <Text>
                {`${team.data?.stripeCurrentBillingPeriodStart?.toLocaleDateString()} - ${team.data?.stripeCurrentBillingPeriodEnd?.toLocaleDateString()}`}
              </Text>
            </div>
          </div>
        </Card.Content>

        <Card.Footer>
          <span>
            Upgrade for{" "}
            <Link
              href="/pricing"
              className="border-b border-primary-500 text-primary-600 hover:text-slate-900"
            >
              increased limits
            </Link>.
          </span>

          <Card.Footer.Actions>
            <Confirm
              title="Are you sure you want to cancel?"
              description="You can come back any time, your endpoints are not deleted."
              onConfirm={() => cancel.mutateAsync({ teamId: team.data!.id })}
              trigger={<Button type="secondary">Cancel</Button>}
            />

            {team.data
              ? team.data?.personal
                ? team.data?.plan === "FREE"
                  ? (
                    <Button
                      onClick={() => handleCheckout("PERSONAL")}
                      disabled={checkout.isLoading || !team.data}
                    >
                      Upgrade to PERSONAL
                    </Button>
                  )
                  : team.data?.plan === "PERSONAL"
                  ? (
                    <Button
                      onClick={() => handleCheckout("PRO")}
                      disabled={checkout.isLoading || !team.data}
                    >
                      Upgrade to PRO
                    </Button>
                  )
                  : team.data?.plan === "PRO"
                  ? (
                    <Button
                      href="mailto:support@planetfall.io?subject=planetfall.io enterprise upgrade"
                      disabled={checkout.isLoading || !team.data}
                    >
                      Upgrade to Enterprise
                    </Button>
                  )
                  : null
                : team.data?.plan === "DISABLED"
                ? (
                  <Button
                    onClick={() => handleCheckout("PRO")}
                    disabled={checkout.isLoading || !team.data}
                  >
                    Upgrade to PRO
                  </Button>
                )
                : (
                  <Button
                    href="mailto:support@planetfall.io"
                    disabled={checkout.isLoading || !team.data}
                  >
                    Upgrade to Enterprise
                  </Button>
                )
              : null}
          </Card.Footer.Actions>
        </Card.Footer>
      </Card>
    </Layout>
  );
}
