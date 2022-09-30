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
import { useUser } from "@clerk/nextjs";
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
  url: string;
  method: "POST" | "GET" | "PUT" | "DELETE";
  headers?: { key: string; value: string }[];
  body?: string;
  degradedAfter?: number;
  failedAfter: number;
  interval: number;
  regions: string[];
};
type RequiredMark = boolean | "optional";

export default function Page() {
  const { user } = useUser();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);

  const breadcrumbs = user?.username ? [] : [];

  const createEndpoint = trpc.endpoint.create.useMutation();
  const regions = trpc.region.list.useQuery({});
  const [form] = Form.useForm<FormData>();
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
      failedAfter,
      interval,
      regions,
    }: FormData,
  ) {
    console.warn({ regions });
    setLoading(true);
    try {
      const res = await createEndpoint.mutateAsync({
        method,
        url,
        body,
        headers: headers?.reduce((acc, { key, value }) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>),
        degradedAfter,
        failedAfter,
        interval,
        regions,
        teamSlug: router.query.teamSlug as string,
      });
      router.push(`/teams/${router.query.teamSlug}/endpoints/${res.id}`);
    } catch (err) {
      console.log(err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Layout breadcrumbs={breadcrumbs}>
      {error
        ? (
          <Alert
            banner
            message={error}
            type="error"
            closable
            onClose={() => {
              setError(null);
            }}
          />
        )
        : null}
      <div className="container mx-auto max-w-3xl">
        <Card
          title="New Endpoint"
          extra="Create a new API and start tracking its latency"
        >
          <Form
            onFinish={submit}
            form={form}
            labelCol={{ span: 8 }}
            layout="vertical"
            initialValues={{
              method: "POST",
              degradedAfter: 100,
              failedAfter: 250,
              interval: 10000,
              regions: [],
            }}
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
              <Col>
                <Form.Item
                  name="failedAfter"
                  label="Failed"
                  required
                  tooltip="After this time the request is considered failed."
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
              <InputNumber addonAfter="ms" min={1} max={10000} />
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
            <Button
              type="primary"
              htmlType="submit"
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
