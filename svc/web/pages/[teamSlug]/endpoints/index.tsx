import { Layout } from "../../../components/app/layout/nav";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { trpc } from "../../../lib/hooks/trpc";
import {
  Button,
  Card,
  Col,
  Empty,
  List,
  PageHeader,
  Row,
  Space,
  Statistic,
  Switch,
  Tag,
} from "antd";

import { ClockCircleOutlined, SyncOutlined } from "@ant-design/icons";

export default function EndpointsPage() {
  const { user } = useUser();

  const router = useRouter();
  const breadcrumbs = user?.username ? [] : [];
  const endpoints = trpc.endpoint.list.useQuery({
    teamSlug: router.query.teamSlug as string,
  });
  return (
    <Layout breadcrumbs={breadcrumbs}>
      <List
        itemLayout="horizontal"
        dataSource={endpoints.data}
        renderItem={(e) => (
          <List.Item>
            <PageHeader
              style={{ width: "100%" }}
              title={e.name}
              subTitle={e.url}
              extra={[
                <Button key="2">Operation</Button>,
                <Button key="1" type="primary">
                  Primary
                </Button>,
              ]}
            >
              <Row>
                <Space>
                  <Statistic
                    title="P50"
                    suffix="ms"
                    value={(Math.random() * 100).toFixed(0)}
                  />
                  <Statistic
                    title="P95"
                    suffix="ms"
                    value={(Math.random() * 100).toFixed(0)}
                  />
                  <Statistic
                    title="P99"
                    suffix="ms"
                    value={(Math.random() * 100).toFixed(0)}
                  />
                </Space>
              </Row>
            </PageHeader>
          </List.Item>
        )}
      />
    </Layout>
  );
}
