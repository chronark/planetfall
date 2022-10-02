import { Layout } from "../../../components/app/layout/nav";
import { useAuth } from "components/auth";
import { useRouter } from "next/router";
import { trpc } from "../../../lib/hooks/trpc";
import { ArrowRightOutlined } from "@ant-design/icons";

import {
  Button,
  Card,
  Col,
  Empty,
  List,
  message,
  PageHeader,
  Popconfirm,
  Row,
  Space,
  Statistic,
  Switch,
  Tag,
  Typography,
} from "antd";
import React, { useMemo } from "react";
import { Endpoint } from ".prisma/client";
import { usePercentile } from "@planetfall/svc/web/lib/hooks/percentile";

export const Item: React.FC<{ endpointId: string }> = (
  { endpointId },
): JSX.Element => {
  const router = useRouter();
  const teamSlug = router.query.teamSlug as string;
  const ctx = trpc.useContext();
  const deleteEndpoint = trpc.endpoint.delete.useMutation({
    onSuccess: () => {
      ctx.endpoint.list.invalidate();
    },
  });
  const since = useMemo(() => Date.now() - 10 * 60 * 1000, [new Date().getMinutes()]);
  const endpoint = trpc.endpoint.get.useQuery({ endpointId, since });

  const p50 = usePercentile(
    0.5,
    (endpoint.data?.checks ?? []).map((c) => c.latency),
  );
  const p95 = usePercentile(
    0.95,
    (endpoint.data?.checks ?? []).map((c) => c.latency),
  );
  const p99 = usePercentile(
    0.99,
    (endpoint.data?.checks ?? []).map((c) => c.latency),
  );
  return (
    <List.Item>
      <PageHeader
        style={{ width: "100%" }}
        title={endpoint.data?.name}
        subTitle={endpoint.data?.url}
        extra={[
          <Popconfirm
            icon={null}
            key="delete"
            title={
              <>
                <Typography.Title level={4}>Delete Endpoint</Typography.Title>
                <Typography.Paragraph>
                  {endpoint.data?.url}
                </Typography.Paragraph>
              </>
            }
            onConfirm={async () => {
              await deleteEndpoint.mutateAsync({ endpointId });
              message.success("Endpoint deleted");
            }}
          >
            <Button>Delete</Button>
          </Popconfirm>,
          <Button
            key="goto"
            type="primary"
            href={`/${teamSlug}/endpoints/${endpointId}`}
          >
            View
          </Button>,
        ]}
      >
        <Row justify="start">
          <Space size="large">
            <Col span={1 / 3}>
              <Typography.Text>
                p50:{" "}
                <Typography.Text
                  strong
                  type={endpoint.data?.failedAfter &&
                      p50 >= endpoint.data?.failedAfter
                    ? "danger"
                    : endpoint.data?.degradedAfter &&
                        p50 >= endpoint.data?.degradedAfter
                    ? "warning"
                    : undefined}
                >
                  {p50}
                </Typography.Text>{" "}
                ms
              </Typography.Text>
            </Col>
            <Col span={1 / 3}>
              <Typography.Text>
                p95:{" "}
                <Typography.Text
                  strong
                  type={endpoint.data?.failedAfter &&
                      p95 >= endpoint.data?.failedAfter
                    ? "danger"
                    : endpoint.data?.degradedAfter &&
                        p95 >= endpoint.data?.degradedAfter
                    ? "warning"
                    : undefined}
                >
                  {p95}
                </Typography.Text>{" "}
                ms
              </Typography.Text>
            </Col>

            <Col span={1 / 3}>
              <Typography.Text>
                p99:{" "}
                <Typography.Text
                  strong
                  type={endpoint.data?.failedAfter &&
                      p99 >= endpoint.data?.failedAfter
                    ? "danger"
                    : endpoint.data?.degradedAfter &&
                        p99 >= endpoint.data?.degradedAfter
                    ? "warning"
                    : undefined}
                >
                  {p99}
                </Typography.Text>{" "}
                ms
              </Typography.Text>
            </Col>
          </Space>
        </Row>
      </PageHeader>
    </List.Item>
  );
};

export default function EndpointsPage() {
  const { user } = useAuth();

  const router = useRouter();
  const breadcrumbs = user?.name ? [] : [];
  const teamSlug = router.query.teamSlug as string;
  const endpoints = trpc.endpoint.list.useQuery({
    teamSlug,
  });
  return (
    <Layout breadcrumbs={breadcrumbs}>
      <Row justify="end">
        <Button type="primary" href={`/${teamSlug}/endpoints/new`}>
          Create new
        </Button>
      </Row>
      <List
        itemLayout="horizontal"
        dataSource={endpoints.data}
        renderItem={(e) => <Item endpointId={e.id} key={e.id} />}
      />
    </Layout>
  );
}
