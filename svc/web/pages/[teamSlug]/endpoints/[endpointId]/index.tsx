import { Layout } from "components/app/layout/nav";
import { useSession, useUser } from "components/auth";
import { useRouter } from "next/router";
import { trpc } from "../../../../lib/hooks/trpc";
import { Area, Line } from "@ant-design/plots";

import {
  Button,
  Card,
  Checkbox,
  CheckboxOptionType,
  Col,
  Divider,
  message,
  PageHeader,
  Popconfirm,
  Row,
  Segmented,
  Select,
  Skeleton,
  Space,
  Spin,
  Statistic,
  Switch,
  Table,
  Tabs,
  Typography,
} from "antd";
import { LoadingOutlined, ReloadOutlined } from "@ant-design/icons";
import React, { useEffect, useMemo, useState } from "react";
import { Check, Endpoint } from "@planetfall/db";
import JSXStyle from "styled-jsx/style";
import { Annotation } from "@antv/g2plot";
import { usePercentile } from "@planetfall/svc/web/lib/hooks/percentile";
import { useSessionStorage } from "@planetfall/svc/web/lib/hooks/storage";
import { CubeTexture } from "three";
import { deflateSync } from "node:zlib";
import { router } from "@planetfall/svc/web/server/router";

const RegionTab: React.FC<
  { endpointId: string; regionId: string; regionName: string }
> = (
  { endpointId, regionId, regionName },
): JSX.Element => {
  const now = useMemo(() => Date.now(), [new Date().getMinutes()]);
  const ctx = trpc.useContext();
  const [since, setSince] = useState(now - 60 * 60 * 1000);
  const endpoint = trpc.endpoint.get.useQuery({ endpointId }, {
    enabled: !!endpointId,
  });

  const checks = trpc.check.list.useQuery({ endpointId, since, regionId }, {
    staleTime: endpoint.data?.interval
      ? endpoint.data.interval * 1000
      : undefined,
    refetchInterval: endpoint.data?.interval
      ? endpoint.data.interval * 1000
      : undefined,
  });

  const annotations: Annotation[] = [];
  if (endpoint.data?.degradedAfter) {
    annotations.push(
      {
        type: "regionFilter",
        start: ["min", endpoint.data.degradedAfter],
        end: ["max", "max"],
        color: "#f59e0b",
      },
      {
        type: "line",
        text: {
          content: "Degraded",
        },
        start: ["min", endpoint.data.degradedAfter],
        end: ["max", endpoint.data.degradedAfter],
        style: {
          stroke: "#f59e0b",
          lineDash: [8, 8],
        },
      },
    );
  }
  if (endpoint.data?.failedAfter) {
    annotations.push(
      {
        type: "regionFilter",
        start: ["min", endpoint.data.failedAfter],
        end: ["max", "max"],
        color: "#ef4444",
      },
      {
        type: "line",
        text: {
          content: "Failed",
        },
        start: ["min", endpoint.data.failedAfter],
        end: ["max", endpoint.data.failedAfter],
        style: {
          stroke: "#ef4444",
          lineDash: [8, 8],
        },
      },
    );
  }

  const p50 = usePercentile(
    0.50,
    (checks.data ?? []).map((d) => d.latency),
  );
  const p95 = usePercentile(
    0.95,
    (checks.data ?? []).map((d) => d.latency),
  );
  const p99 = usePercentile(
    0.99,
    (checks.data ?? []).map((d) => d.latency),
  );

  console.log("data", JSON.stringify(checks.data, null, 2));

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Typography.Title level={3}>
        {regionName}
      </Typography.Title>

      <Row justify="end">
        <Space size="large">
          <Col span={1 / 3}>
            <Typography.Text>
              p50: <Typography.Text strong>{p50}</Typography.Text> ms
            </Typography.Text>
          </Col>
          <Col span={1 / 3}>
            <Typography.Text>
              p95: <Typography.Text strong>{p95}</Typography.Text> ms
            </Typography.Text>
          </Col>

          <Col span={1 / 3}>
            <Typography.Text>
              p99: <Typography.Text strong>{p99}</Typography.Text> ms
            </Typography.Text>
          </Col>
          <Segmented
            value={since}
            options={[
              {
                label: "1m",
                value: now - 60 * 1000,
              },
              {
                label: "15m",
                value: now - 15 * 60 * 1000,
              },
              {
                label: "1h",
                value: now - 60 * 60 * 1000,
              },
              {
                label: "3h",
                value: now - 3 * 60 * 60 * 1000,
              },
              {
                label: "6h",
                value: now - 6 * 60 * 60 * 1000,
              },
              {
                label: "24h",
                value: now - 24 * 60 * 60 * 1000,
              },
            ]}
            onChange={(v) => {
              setSince(parseInt(v.toString()));
            }}
          />
          <Button
            disabled={!endpoint.isStale}
            icon={<ReloadOutlined />}
            loading={endpoint.isFetching || endpoint.isLoading}
            onClick={() => {
              ctx.endpoint.get.invalidate();
            }}
          >
          </Button>
        </Space>
      </Row>
      <Line
        data={(checks.data ?? []).map((c) => ({
          time: c.time.toLocaleString(),
          latency: c.latency,
        }))}
        padding="auto"
        xField="time"
        yField="latency"
        smooth
        color="#3366FF"
        autoFit={true}
        legend={{
          position: "bottom",
        }}
        annotations={annotations}
        yAxis={{
          title: { text: "Latency [ms]" },
          tickCount: 3,
        }}
        xAxis={{
          tickCount: 10,
          label: {
            formatter: (text) => new Date(text).toLocaleTimeString(),
          },
        }}
        tooltip={{
          title: (d) => new Date(d).toLocaleString(),
        }}
      />
    </Space>
  );
};

const Main: React.FC<{ endpointId: string; teamSlug: string }> = (
  { endpointId, teamSlug },
): JSX.Element => {
  const router = useRouter();
  const now = useMemo(() => Date.now(), [new Date().getMinutes()]);
  const ctx = trpc.useContext();
  const [since, setSince] = useState(now - 60 * 60 * 1000);
  const deleteEndpoint = trpc.endpoint.delete.useMutation();
  const endpoint = trpc.endpoint.get.useQuery({ endpointId }, {
    staleTime: 10000,
  });
  const checks = trpc.check.list.useQuery({ since, endpointId }, {
    enabled: !!endpointId,
    staleTime: endpoint.data?.interval
      ? endpoint.data.interval * 1000
      : undefined,
    refetchInterval: endpoint.data?.interval
      ? endpoint.data.interval * 1000
      : undefined,
  });
  const regions = trpc.region.list.useQuery();

  const annotations: Annotation[] = [];
  if (endpoint.data?.failedAfter) {
    annotations.push({
      type: "line",
      start: ["min", endpoint.data.failedAfter],
      end: ["max", endpoint.data.failedAfter],
      style: {
        stroke: "#ef4444",
        lineWidth: 1.5,
        lineDash: [8, 8],
      },
      text: {
        offsetY: -4,
        content: "Failed",
      },
    });
  }

  if (endpoint.data?.degradedAfter) {
    annotations.push({
      type: "line",
      start: ["min", endpoint.data.degradedAfter],
      end: ["max", endpoint.data.degradedAfter],
      style: {
        stroke: "#f59e0b",
        lineWidth: 1,
        lineDash: [8, 8],
      },
      text: {
        offsetY: -4,
        content: "Degraded",
      },
    });
  }

  const data = useMemo(() => {
    return (checks.data ?? []).map((c) => ({
      time: c.time.toLocaleString(),
      latency: c.latency,
      regionId: regions.data?.find((r) => r.id === c.regionId)?.name,
    }));
  }, [checks.data]);

  const p50 = usePercentile(0.50, data.map((d) => d.latency));
  const p95 = usePercentile(0.95, data.map((d) => d.latency));
  const p99 = usePercentile(0.99, data.map((d) => d.latency));
  return (
    <>
      <Row justify="space-between">
        <Col>
          <Space direction="vertical">
            <Typography.Title level={1}>
              {endpoint.data?.name ?? endpoint.data?.url}
            </Typography.Title>
            <Typography.Link>
              {endpoint.data?.name ? endpoint.data?.url : null}
            </Typography.Link>
          </Space>
        </Col>
        <Col>
          <Space>
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
                router.push(`/${teamSlug}/endpoints`);
                message.success("Endpoint deleted");
              }}
            >
              <Button>Delete</Button>
            </Popconfirm>
            <Button
              type="primary"
              href={`/${teamSlug}/endpoints/${endpointId}/settings`}
            >
              Settings
            </Button>
          </Space>
        </Col>
      </Row>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Row justify="end">
          <Space size="large">
            <Col span={1 / 3}>
              <Typography.Text>
                p50: <Typography.Text strong>{p50}</Typography.Text> ms
              </Typography.Text>
            </Col>
            <Col span={1 / 3}>
              <Typography.Text>
                p95: <Typography.Text strong>{p95}</Typography.Text> ms
              </Typography.Text>
            </Col>

            <Col span={1 / 3}>
              <Typography.Text>
                p99: <Typography.Text strong>{p99}</Typography.Text> ms
              </Typography.Text>
            </Col>
            <Segmented
              value={since}
              options={[
                {
                  label: "1m",
                  value: now - 60 * 1000,
                },
                {
                  label: "15m",
                  value: now - 15 * 60 * 1000,
                },
                {
                  label: "1h",
                  value: now - 60 * 60 * 1000,
                },
                {
                  label: "3h",
                  value: now - 3 * 60 * 60 * 1000,
                },
                {
                  label: "6h",
                  value: now - 6 * 60 * 60 * 1000,
                },
                {
                  label: "24h",
                  value: now - 24 * 60 * 60 * 1000,
                },
              ]}
              onChange={(v) => {
                setSince(parseInt(v.toString()));
              }}
            />
            <Button
              disabled={!endpoint.isStale}
              icon={<ReloadOutlined />}
              loading={endpoint.isFetching || endpoint.isLoading}
              onClick={() => {
                ctx.endpoint.get.invalidate();
              }}
            />
          </Space>
        </Row>
        <Line
          data={data}
          xField="time"
          yField="latency"
          seriesField="regionId"
          autoFit={true}
          smooth={true}
          connectNulls={false}
          legend={{
            position: "bottom",
          }}
          yAxis={{
            title: { text: "Latency [ms]" },
            tickCount: 3,
          }}
          annotations={annotations}
          xAxis={{
            tickCount: 10,
            label: {
              formatter: (text) => new Date(text).toLocaleTimeString(),
            },
          }}
          tooltip={{
            title: (d) => new Date(d).toLocaleString(),
          }}
        />
      </Space>
    </>
  );
};

export default function EndpointPage() {
  const router = useRouter();
  const teamSlug = router.query.teamSlug as string;
  const endpointId = router.query.endpointId as string;
  const [breadcrumbs, setBreadcrumbs] = useState([{
    label: endpointId,
    href: `/${teamSlug}/endpoints/${endpointId}`,
  }]);
  const endpoint = trpc.endpoint.get.useQuery({ endpointId });
  const regions = trpc.region.list.useQuery();
  useEffect(() => {
    if (endpoint.data) {
      setBreadcrumbs([{
        label: endpoint.data.name ?? endpoint.data.url,
        href: `/${teamSlug}/endpoints/${endpointId}`,
      }]);
    }
  }, [endpoint.data]);

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <Space
        size={48}
        direction="vertical"
        style={{ width: "100%", marginBottom: 100 }}
      >
        <Main endpointId={endpointId} teamSlug={teamSlug} />
        <Divider />

        <Typography.Title level={2}>Latency By Region</Typography.Title>
        <Tabs
          tabPosition="left"
          style={{ height: "50vh" }}
          items={regions.data?.filter((r) =>
            (endpoint.data?.regions as string[])?.includes(r.id)
          ).map((
            region,
          ) => ({
            label: region.name,
            key: region.id,
            children: (
              <div style={{ margin: "0 0 0 3rem" }}>
                <RegionTab
                  endpointId={endpointId}
                  regionId={region.id}
                  regionName={region.name}
                />
              </div>
            ),
          }))}
        />
      </Space>
    </Layout>
  );
}
