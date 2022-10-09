import { Layout } from "../../components/app/layout/nav";

import React from "react";
import { useRouter } from "next/router";
import { Card } from "components";
import {
  Avatar,
  List,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import { trpc } from "../../lib/hooks/trpc";
import Item from "antd/lib/list/Item";
import { Heading } from "../../components/heading";
import { Text } from "../../components";

export default function Teampage() {
  const router = useRouter();
  const teamSlug = router.query.teamSlug as string;
  // router.push(router.asPath + "/endpoints");
  const team = trpc.team.get.useQuery({ teamSlug }, { enabled: !!teamSlug });

  return (
    <Layout breadcrumbs={[]}>
      <Space direction="vertical" size={32} style={{ width: "100%" }}>
        <Heading h2>{team.data?.name ?? ""}</Heading>


        <Card>
          <Card.Header>
            <Card.Header.Title title="Members" />
          </Card.Header>
          <Card.Content>

            <List
              loading={team.isLoading}
              itemLayout="horizontal"
              dataSource={team.data?.members}
              renderItem={(member) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={member.user.image} />}
                    title={member.user.name}
                    description={member.role}
                  />
                </List.Item>
              )}
            />
          </Card.Content>

        </Card>
      </Space>
    </Layout>
  );
}
