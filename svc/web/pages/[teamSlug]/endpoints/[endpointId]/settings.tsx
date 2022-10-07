import { Layout } from "components/app/layout/nav";
import { Fragment, useEffect, useMemo, useState } from "react";
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
const gutter = 16;

type FormData = {
  name?: string;
  url: string;
  method: "POST" | "GET" | "PUT" | "DELETE";
  headers?: { key: string; value: string }[];
  body?: string;
  degradedAfter?: number;
  interval: number;
  regions: string[];
};
type RequiredMark = boolean | "optional";

export default function Page() {
  useSession();
  const router = useRouter();
  const teamSlug = router.query.teamSlug as string;
  const endpointId = router.query.endpointId as string;
  const [form] = Form.useForm<FormData>();

  const endpoint = trpc.endpoint.get.useQuery({ endpointId }, {
    enabled: !!endpointId,
    refetchInterval: false,
    refetchOnReconnect: false,
  });
  useEffect(() => {
    if (endpoint.data) {
      form.resetFields();
      form.setFieldsValue({
        method: endpoint.data.method,
        url: endpoint.data.url,
        "headers": Object.entries(endpoint.data.headers ?? {}).map((
          [key, value],
        ) => ({ key, value })),
        body: endpoint.data.body ?? undefined,
        degradedAfter: endpoint.data.degradedAfter ?? undefined,
        interval: endpoint.data.interval ?? undefined,
        regions: endpoint.data.regions as string[] ?? [],
      });
    }
  }, [endpoint.data]);

  const breadcrumbs = [
    {
      label: endpoint.data?.name ?? endpoint.data?.url ?? endpointId,
      href: `/${teamSlug}/endpoints/${endpointId}`,
    },
    {
      label: "Settings",
      href: `/${teamSlug}/endpoints/${endpointId}/settings`,
    },
  ];
  const updateEndpoint = trpc.endpoint.update.useMutation();
  const regions = trpc.region.list.useQuery();
  const [requiredMark, setRequiredMarkType] = useState<RequiredMark>(
    "optional",
  );

  const onRequiredTypeChange = (
    { requiredMarkValue }: { requiredMarkValue: RequiredMark },
  ) => {
    setRequiredMarkType(requiredMarkValue);
  };
  const [loading, setLoading] = useState(false);

  async function submit(
    {
      url,
      method,
      headers,
      body,
      degradedAfter,
      interval,
      regions,
    }: FormData,
  ) {
    setLoading(true);
    try {
      const res = await updateEndpoint.mutateAsync({
        endpointId,
        method,
        url,
        body,
        headers: headers
          ? headers?.reduce((acc, { key, value }) => {
            acc[key] = value;
            return acc;
          }, {} as Record<string, string>)
          : undefined,
        degradedAfter,
        interval,
        regions,
        teamSlug: router.query.teamSlug as string,
      });

      router.push(`/${router.query.teamSlug}/endpoints/${res.id}`);
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
          title="Edit Endpoint"
          extra="Reconfigure this endpoint"
        >
          <Form
            onFinish={submit}
            form={form}
            layout="horizontal"
            onValuesChange={onRequiredTypeChange}
            requiredMark={requiredMark}
          >
            <Typography.Title level={3}>URL</Typography.Title>

            <Form.Item
              name="url"
              rules={[{ required: true, type: "url" }]}
            >
              <Input
                addonBefore={
                  <Form.Item name="method" noStyle>
                    <Select style={{ width: "auto" }}>
                      <Option value="POST">POST</Option>
                      <Option value="GET">GET</Option>
                      <Option value="PUT">PUT</Option>
                      <Option value="DELETE">DELETE</Option>
                    </Select>
                  </Form.Item>
                }
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Space />
            <Divider />
            <Space />

            <Form.List name="headers">
              {(fields, { add, remove }) => (
                <>
                  <Row justify="space-between">
                    <Typography.Title level={3}>HTTP Headers</Typography.Title>
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={() => add()}
                    >
                    </Button>
                  </Row>

                  {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} gutter={gutter} justify="space-between">
                      <Col flex="auto">
                        <Row gutter={gutter}>
                          <Col
                            style={{ display: "inline-block", width: "50%" }}
                          >
                            <Form.Item
                              {...restField}
                              name={[name, "key"]}
                              rules={[{
                                required: true,
                                message: "Missing header key",
                              }]}
                            >
                              <Input placeholder="Key" />
                            </Form.Item>
                          </Col>
                          <Col
                            style={{ display: "inline-block", width: "50%" }}
                          >
                            <Form.Item
                              {...restField}
                              name={[name, "value"]}
                              rules={[{
                                required: true,
                                message: "Missing header value",
                              }]}
                            >
                              <Input placeholder="Value" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Col>
                      <Col style={{}}>
                        <Button
                          type="link"
                          icon={<MinusIcon />}
                          onClick={() =>
                            remove(name)}
                        />
                      </Col>
                    </Row>
                  ))}
                </>
              )}
            </Form.List>
            <Space />
            <Divider />
            <Space />
            <Typography.Title level={3}>Request Body</Typography.Title>
            <Typography.Paragraph>
              Make sure to add the correct <Tag>Content-Type</Tag>{" "}
              header when using a request body.
            </Typography.Paragraph>

            <Form.Item name="body">
              <TextArea allowClear rows={5} />
            </Form.Item>
            <Space />
            <Divider />
            <Space />
            <Typography.Title level={3}>Health Checks</Typography.Title>
            <Typography.Paragraph>
              Set thresholds for your API response times.
            </Typography.Paragraph>

            <Row gutter={gutter}>
              <Col flex="auto">
                <Form.Item
                  name="degradedAfter"
                  label="Degraded"
                  required
                  tooltip="After this time the request is considered degraded."
                >
                  <InputNumber addonAfter="ms" min={1} max={10000} />
                </Form.Item>
              </Col>
            </Row>

            <Space />
            <Divider />
            <Space />
            <Typography.Title level={3}>Interval and Regions</Typography.Title>
            <Typography.Paragraph>
              How frequently should we fetch your API? And where should we fetch
              it from?
            </Typography.Paragraph>

            <Form.Item name="interval" label="Interval" required>
              <InputNumber addonAfter="s" min={15} max={60 * 60} />
            </Form.Item>

            <Form.Item
              name="regions"
              required
              label="Regions"
            >
              {
                /* <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
                Check all
              </Checkbox> */
              }
              <Checkbox.Group style={{ width: "100%" }}>
                <Row>
                  {regions.data?.map((region) => (
                    <Col key={region.id} span={8}>
                      <Checkbox value={region.id}>{region.name}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>

            <Space />
            <Divider />
            <Space />
            <Row justify="end">
              <Button
                type="primary"
                size="large"
                htmlType="button"
                loading={loading}
                onClick={() => {
                  form.submit();
                }}
              >
                Update
              </Button>
            </Row>
          </Form>
        </Card>
      </div>
    </Layout>
  );
}
