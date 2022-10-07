import { Fragment, useState } from "react";
import { Layout } from "components/app/layout/nav";
import * as Dialog from "@radix-ui/react-dialog";
import { Transition } from "@headlessui/react";
import classNames from "classnames";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@planetfall/svc/web/lib/hooks/trpc";
import { useRouter } from "next/router";
import { useSession, useUser } from "components/auth";
import { Heading } from "@planetfall/svc/web/components/heading";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Radio,
  Row,
  Select,
  Slider,
  Space,
  Steps,
  Tag,
  Typography,
} from "antd";
import { InformationCircleIcon, MinusIcon } from "@heroicons/react/24/solid";
import { Option } from "antd/lib/mentions";
import TextArea from "antd/lib/input/TextArea";
import slugify from "slugify";
const gutter = 16;

type FormData = {
  name: string;
  endpointIds: string[];
};
type RequiredMark = boolean | "optional";

export default function Page() {
  useSession();
  const { user } = useUser();
  const router = useRouter();

  const breadcrumbs = user?.name ? [] : [];
  const teamSlug = router.query.teamSlug as string;

  const createPage = trpc.page.create.useMutation();
  const endpoints = trpc.endpoint.list.useQuery({ teamSlug });
  const [form] = Form.useForm<FormData>();
  const [requiredMark, setRequiredMarkType] = useState<RequiredMark>(
    "optional",
  );

  const protocol = process.env.NEXT_PUBLIC_VERCEL_ENV ? "https" : "http";
  const host = process.env.NEXT_PUBLIC_VERCEL_ENV
    ? "planetfall.io"
    : "localhost:3000";
  const onRequiredTypeChange = (
    { requiredMarkValue }: { requiredMarkValue: RequiredMark },
  ) => {
    setRequiredMarkType(requiredMarkValue);
  };
  const [loading, setLoading] = useState(false);

  async function submit(
    {
      name,
      endpointIds,
    }: FormData,
  ) {
    setLoading(true);
    try {
      const res = await createPage.mutateAsync({
        name,
        slug: slugify(name, { lower: true, replacement: "_" }),
        endpointIds,
        teamSlug: router.query.teamSlug as string,
      });

      router.push(`${protocol}://${res.slug}.${host}`);
    } catch (err) {
      console.error(err);
      message.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Layout breadcrumbs={breadcrumbs}>
      <div>
        <Card
          title="New Status Page"
          extra="Create a new public status page"
        >
          <Form
            onFinish={submit}
            form={form}
            layout="vertical"
            onValuesChange={onRequiredTypeChange}
            requiredMark={requiredMark}
          >
            <Space style={{ width: "100%" }}>
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true }]}
              >
                <Input
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Space>
            <Divider />

            <Form.Item
              name="endpointIds"
              required
              label="Endpoints"
            >
              <Checkbox.Group style={{ width: "100%" }}>
                <Row>
                  {endpoints.data?.map((endpoint) => (
                    <Col key={endpoint.id} span={8}>
                      <Checkbox value={endpoint.id}>
                        {endpoint.name ?? endpoint.url}
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>

            <Space />
            <Divider />
            <Space />
            <Button
              type="primary"
              htmlType="button"
              loading={loading}
              onClick={() => {
                form.submit();
              }}
            >
              Create
            </Button>
          </Form>
        </Card>
      </div>
    </Layout>
  );
}
