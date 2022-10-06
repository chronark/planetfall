import { Layout } from "../../../components/app/layout/nav";

import React from "react";
import { useRouter } from "next/router";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  List,
  Row,
  Space,
  Statistic,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { trpc } from "../../../lib/hooks/trpc";
import { DEFAULT_QUOTA } from "@planetfall/svc/web/plans";

export default function SettingsPage() {
  const router = useRouter();
  const teamSlug = router.query.teamSlug as string;
  // router.push(router.asPath + "/endpoints");
  const team = trpc.team.get.useQuery({ teamSlug }, { enabled: !!teamSlug });
  const checkout = trpc.billing.checkout.useMutation();

  const usage = trpc.billing.usage.useQuery({ teamId: team.data?.id ?? "" }, {
    enabled: !!team.data?.id,
  });
  console.log({ usage: usage.data });
  console.log(JSON.stringify(team.data, null, 2));

  const protocol = process.env.NEXT_PUBLIC_VERCEL_ENV ? "https" : "http";
  const host = process.env.NEXT_PUBLIC_VERCEL_ENV
    ? "planetfall.io"
    : "localhost:3000";

  async function handleCheckout() {
    const { url } = await checkout.mutateAsync({
      teamId: team.data!.id,
      returnUrl: `${protocol}://${host}/${router.asPath}`,
    });
    if (url) {
      router.push(url);
    }
  }
  return (
    <Layout breadcrumbs={[]}>
      <Space direction="vertical" size={32} style={{ width: "100%" }}>
        <Typography.Title level={1}>Settings</Typography.Title>

        <Card
          title={
            <Row justify="space-between" align="middle">
              <Typography.Title>Plan</Typography.Title>
              <Tag color="blue">{team.data?.plan}</Tag>
            </Row>
          }
          actions={[
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
          ]}
        >
          <Card.Meta
            title={team.data?.stripeTrialExpires
              ? (
                <Typography.Text>
                  Your <Typography.Text underline>Pro Trial</Typography.Text>
                  {" "}
                  expires in{" "}
                  {(((team.data?.stripeTrialExpires?.getTime() ?? 0) -
                    Date.now()) / 24 / 60 / 60 / 1000).toFixed(0)}{" "}
                  days. To maintain access to premium features, upgrade to Pro.
                </Typography.Text>
              )
              : null}
          />
          <div>
            <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="overflow-hidden py-5 sm:p-6">
                <dt className="truncate text-sm font-medium text-slate-500">
                  Requests
                </dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                  {`${usage.data?.usage.toLocaleString()}
                  ${
                    team.data?.plan === "PERSONAL"
                      ? `/ ${DEFAULT_QUOTA.PERSONAL.maxMonthlyRequests?.toLocaleString()}`
                      : ""
                  }`}
                </dd>
              </div>
              <div className="overflow-hidden py-5 sm:p-6">
                <dt className="truncate text-sm font-medium text-slate-500">
                  Usage Cost
                </dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                  {`$${((usage.data?.usage ?? 0) / 10000).toFixed(2)}`}
                </dd>
              </div>
              {team.data?.stripeTrialExpires
                ? (
                  <div className="overflow-hidden py-5 sm:p-6">
                    <dt className="truncate text-sm font-medium text-slate-500">
                      Trial left
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                      {((team.data.stripeTrialExpires.getTime() - Date.now()) /
                        24 / 60 / 60 / 1000).toFixed(0)} Days
                    </dd>
                  </div>
                )
                : (
                  <div className="overflow-hidden py-5 sm:p-6">
                    <dt className="truncate text-sm font-medium text-slate-500">
                      Billing Cycle
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                      {`${team.data?.stripeCurrentBillingPeriodStart?.toLocaleDateString()} - ${team.data?.stripeCurrentBillingPeriodEnd?.toLocaleDateString()}`}
                    </dd>
                  </div>
                )}
            </dl>
          </div>
        </Card>
      </Space>
    </Layout>
  );
}
