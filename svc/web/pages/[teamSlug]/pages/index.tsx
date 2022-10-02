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
  const since = useMemo(() => Date.now() - 10 * 60 * 1000, [
    new Date().getMinutes(),
  ]);
  const page = trpc.page.get.useQuery({ pageId });

  return (
    <List.Item>
      <PageHeader
        style={{ width: "100%" }}
        title={page.data?.name}
        subTitle={page.data?.slug}
        extra={[
          <Popconfirm
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
            key="goto"
            type="primary"
            href={`/${teamSlug}/pages/${pageId}`}
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
  const { user } = useAuth();

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
