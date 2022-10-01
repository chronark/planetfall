import { Layout } from "../../../components/app/layout/nav";
import { useUser } from "@clerk/nextjs";
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
import React from "react";
import { Endpoint } from ".prisma/client";

export const Item: React.FC<{ endpoint: Endpoint }> = (
  { endpoint },
): JSX.Element => {
  const router = useRouter();
  const teamSlug = router.query.teamSlug as string;
  const ctx = trpc.useContext();
  const deleteEndpoint = trpc.endpoint.delete.useMutation({
    onSuccess: () => {
      ctx.endpoint.list.invalidate();
    },
  });
  return (
    <List.Item>
      <PageHeader
        style={{ width: "100%" }}
        title={endpoint.name}
        subTitle={endpoint.url}
        extra={[
          <Popconfirm
            icon={null}
            key="delete"
            title={
              <>
                <Typography.Title level={4}>Delete Endpoint</Typography.Title>
                <Typography.Paragraph>{endpoint.url}</Typography.Paragraph>
              </>
            }
            onConfirm={async () => {
              await deleteEndpoint.mutateAsync({ endpointId: endpoint.id });
              message.success("Endpoint deleted");
            }}
          >
            <Button>Delete</Button>
          </Popconfirm>,
          <Button
            key="goto"
            type="primary"
            href={`/${teamSlug}/endpoints/${endpoint.id}`}
          >
            View
          </Button>,
        ]}
      >
        <Row>
          <Space>
            <Statistic
              title="P50"
              value={(Math.random() * 100).toFixed(0)}
            />
            <Statistic
              title="P95"
              value={(Math.random() * 100).toFixed(0)}
            />
            <Statistic
              title="P99"
              value={(Math.random() * 100).toFixed(0)}
            />
          </Space>
        </Row>
      </PageHeader>
    </List.Item>
  );
};

export default function EndpointsPage() {
  const { user } = useUser();

  const router = useRouter();
  const breadcrumbs = user?.username ? [] : [];
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
        renderItem={(e) => <Item endpoint={e} key={e.id} />}
      />
    </Layout>
  );
}
