import { Layout } from "../../../components/app/layout/nav";
import { useSession, useUser } from "components/auth";
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

export const Item: React.FC<{ pageId: string }> = (
  { pageId },
): JSX.Element => {
  const router = useRouter();
  const teamSlug = router.query.teamSlug as string;
  const ctx = trpc.useContext();
  const deletePage = trpc.page.delete.useMutation({
    onSuccess: () => {
      ctx.page.list.invalidate();
    },
  });
  const since = useMemo(() => Date.now() - 10 * 60 * 1000, []);
  const page = trpc.page.get.useQuery({ pageId });
  const protocol = process.env.NEXT_PUBLIC_VERCEL_ENV ? "https" : "http";
  const host = process.env.NEXT_PUBLIC_VERCEL_ENV
    ? "planetfall.io"
    : "localhost:3000";
  return (
    <List.Item>
      <PageHeader
        style={{ width: "100%" }}
        title={page.data?.name}
        subTitle={page.data?.slug}
        extra={[
          <Popconfirm
            disabled={!page.data}
            icon={null}
            key="delete"
            title={
              <>
                <Typography.Title level={4}>Delete Endpoint</Typography.Title>
                <Typography.Paragraph>
                  {page.data?.name}
                </Typography.Paragraph>
              </>
            }
            onConfirm={async () => {
              await deletePage.mutateAsync({ pageId });
              message.success("Endpoint deleted");
            }}
          >
            <Button>Delete</Button>
          </Popconfirm>,
          <Button
            disabled={!page.data}
            key="goto"
            type="primary"
            href={`${protocol}://${page.data?.slug}.${host}           `}
          >
            View
          </Button>,
        ]}
      >
      </PageHeader>
    </List.Item>
  );
};

export default function Pagespage() {
  useSession();
  const { user } = useUser();

  const router = useRouter();
  const breadcrumbs = user?.name ? [] : [];
  const teamSlug = router.query.teamSlug as string;
  const pages = trpc.page.list.useQuery({
    teamSlug,
  });
  return (
    <Layout breadcrumbs={breadcrumbs}>
      <Row justify="end">
        <Button type="primary" href={`/${teamSlug}/pages/new`}>
          Create new
        </Button>
      </Row>
      <List
        itemLayout="horizontal"
        dataSource={pages.data}
        renderItem={(e) => <Item pageId={e.id} key={e.id} />}
      />
    </Layout>
  );
}
