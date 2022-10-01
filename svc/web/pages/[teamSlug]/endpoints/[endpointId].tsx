import { Layout } from "../../../components/app/layout/nav";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { trpc } from "../../../lib/hooks/trpc";
import { Line } from "@ant-design/plots";

import {
    Button,
    Card,
    Checkbox,
    CheckboxOptionType,
    Col,
    Divider,
    List,
    message,
    PageHeader,
    Popconfirm,
    Row,
    Select,
    Space,
    Statistic,
    Switch,
    Tag,
    Typography,
} from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { Check, Endpoint } from "@planetfall/db";
import JSXStyle from "styled-jsx/style";
import { Annotation, P } from "@antv/g2plot";
import { usePercentile } from "@planetfall/svc/web/lib/hooks/percentile";
import { useSessionStorage } from "@planetfall/svc/web/lib/hooks/storage";

export const Item: React.FC<{ region: string; checks: Check[] }> = (
    { region, checks },
): JSX.Element => {
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
                title={region}
                // subTitle={endpoint.url}
                extra={[
                    <Popconfirm
                        icon={null}
                        key="delete"
                        title={
                            <>
                                <Typography.Title level={4}>Delete Endpoint</Typography.Title>
                                {/* <Typography.Paragraph>{endpoint.url}</Typography.Paragraph> */}
                            </>
                        }
                        onConfirm={async () => {
                            // await deleteEndpoint.mutateAsync({ endpointId: endpoint.id });
                            message.success("Endpoint deleted");
                        }}
                    >
                        <Button>Delete</Button>
                    </Popconfirm>,
                    <Button key="1" type="primary">
                        Primary
                    </Button>,
                ]}
            >
            </PageHeader>
            <div style={{ width: "100%", height: "10vh" }}>
                <Line
                    data={checks.map((c) => ({
                        time: c.time.toISOString(),
                        latency: c.latency,
                    }))}
                    xField="time"
                    yField="latency"
                    seriesField=""
                    autoFit={true}
                    yAxis={{
                        title: { text: "Latency [ms]" },
                        tickCount: 3,
                    }}
                    xAxis={{
                        tickCount: 5,
                        label: {
                            formatter: (text) => new Date(text).toLocaleTimeString(),
                        },
                    }}
                    tooltip={{
                        title: (d) => new Date(d).toLocaleString(),
                    }}
                />
            </div>
        </List.Item>
    );
};

export default function EndpointPage() {
    const { user } = useUser();

    const router = useRouter();
    const breadcrumbs = user?.username ? [] : [];
    const teamSlug = router.query.teamSlug as string;
    const endpointId = router.query.endpointId as string;
    const endpoint = trpc.endpoint.get.useQuery({
        endpointId,
        since: new Date().getUTCDate() - 60 * 60 * 1000,
    });

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
                stroke: "#94a3b8",
                lineWidth: 1,
                lineDash: [8, 8],
            },
            text: {
                offsetY: -4,
                content: "Degraded",
            },
        });
    }
    const regions = useMemo(
        () =>
            [...new Set(endpoint.data?.checks.map((c) => c.regionId) ?? [])].sort(),
        [endpoint.data],
    );
    const [selectedRegions, setSelectedRegions] = useSessionStorage<string[]>(
        `${endpointId}:displayedRegions`,
        [],
    );
    console.log({ selectedRegions });

    const data = useMemo(() => {
        return (endpoint.data?.checks ?? []).filter((c) =>
            selectedRegions.includes(c.regionId)
        ).sort((a, b) => a.time.getTime() - b.time.getTime()).map((c) => ({
            time: c.time.toISOString(),
            latency: c.latency,
            regionId: c.regionId.replace("VERCEL:", "").toUpperCase(),
        }));
    }, [endpoint.data, selectedRegions]);

    const p50 = usePercentile(0.50, data.map((d) => d.latency));
    const p95 = usePercentile(0.95, data.map((d) => d.latency));
    const p99 = usePercentile(0.99, data.map((d) => d.latency));

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <Row justify="end">
                <Button type="primary" href={`/${teamSlug}/endpoints/new`}>
                    Create new
                </Button>
            </Row>
            <PageHeader
                title={endpoint.data?.url}
            >
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
                                p95: <Typography.Text strong>{p95}</Typography.Text> ms
                            </Typography.Text>
                        </Col>
                    </Space>
                </Row>
            </PageHeader>
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
                    tickCount: 5,
                    label: {
                        formatter: (text) => new Date(text).toLocaleTimeString(),
                    },
                }}
                tooltip={{
                    title: (d) => new Date().toLocaleString(),
                }}
            />

            <Typography.Title level={4}>Filter regions</Typography.Title>

            <Checkbox.Group
                style={{ width: "100%" }}
                value={selectedRegions}
                onChange={(v) => setSelectedRegions(v.map((x) => x.toString()))}
            >
                <Row gutter={16} justify="center" >
                    {regions.map((region) => (
                        <Col key={region} span={4}>
                            <Checkbox value={region}>
                                {region.replace("VERCEL:", "").toUpperCase()}
                            </Checkbox>
                        </Col>
                    ))}
                </Row>
            </Checkbox.Group>
        </Layout>
    );
}
