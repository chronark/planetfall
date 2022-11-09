import PageHeader from "@/components/page/header";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { notFound, redirect } from "next/navigation";
import { Client as Tinybird } from "@planetfall/tinybird"

import Button from "@/components/button/button";
import { currentUser } from "@clerk/nextjs/app-beta";
import { db } from "@planetfall/db";
import { Stats } from "@/components/stats";
import { ErrorsTable } from "./errors-table"
import { Heading } from "@/components/heading";
import { LatestTable } from "./latest-table";
// import Confirm from "@/components/confirm/confirm";
export default async function Page(props: { params: { orgSlug: string, endpointId: string } }) {



    const user = await currentUser()
    if (!user) {
        redirect("/auth/sign-in")
        return
    }
    const org = await clerkClient.organizations.getOrganization({ slug: props.params.orgSlug })


    const endpoint = await db.endpoint.findUnique({
        where: {
            id: props.params.endpointId,
        }
    })
    if (!endpoint) {
        notFound()
        return
    }
    if (endpoint.orgId != org.id) {
        throw new Error("Acc ess denied")
    }


    const tb = new Tinybird()

    const [stats, latestChecks, errors] = await Promise.all([
        tb.getEndpointStats(endpoint.id),
        tb.getLatestChecksByEndpoint(endpoint.id),
        tb.getLatestChecksByEndpoint(endpoint.id, true)

    ])

    if (!stats) {
        notFound()
        return
    }



    const availability = stats.count > 0 ? 1 - errors.length / stats.count : 1;
    const degraded = 0 //checks.data
    //   ? (endpoint.data?.degradedAfter
    //     ? (checks.data ?? []).filter((d) =>
    //       d.latency && d.latency >= endpoint.data.degradedAfter!
    //     ).length
    //     : 0) / checks.data.length
    //   : 1;


    return <div>
        <PageHeader sticky title={endpoint.name ?? endpoint.url} description={endpoint.id}
            actions={[
                endpoint.active
                    ? (
                        <div className="flex h-6 w-6 items-center justify-center mr-2">
                            <span className="animate-ping-slow absolute inline-flex h-4 w-4 rounded-full bg-emerald-400 opacity-50">
                            </span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500">
                            </span>
                        </div>
                    )
                    : (
                        <div className="flex h-6 w-6 items-center justify-center mr-2">
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500">
                            </span>
                        </div>
                    ),

                <Button
                    key="update"
                    type="secondary"
                    href={`/${props.params.orgSlug}/endpoints/${props.params.endpointId}/settings`}

                >
                    {endpoint.active ? "Active" : "Paused"}
                </Button>,
                // <Confirm
                //     key="delete"
                //     title="Delete Endpoint?"
                //     description={endpoint.name ?? endpoint.url}
                //     onConfirm={async () => {
                //         alert("TODO:")
                //     }}
                //     trigger={<Button type="secondary">Delete</Button>}
                // />,
                <Button
                    key="settings"
                    type="secondary"
                    href={`/${props.params.orgSlug}/endpoints/${props.params.endpointId}/settings`}
                >
                    Settings
                </Button>,
            ]}

        />
        <main className="container mx-auto divide-y">

            <div className="w-full flex justify-between items-center gap-2 md:gap-4 lg:gap-8 pb-4 md:pb-8 lg:pb-16">
                <Stats
                    label="Availability"
                    status={availability > 0.99
                        ? undefined
                        : availability >= 0.95
                            ? "warn"
                            : "error"}
                    value={(availability * 100).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                    })}
                    suffix="%"
                />
                {endpoint.degradedAfter
                    ? (
                        <Stats
                            label="Degraded"
                            status={degraded <= 0.01
                                ? "success"
                                : degraded <= 0.05
                                    ? "warn"
                                    : "error"}
                            value={(degraded * 100).toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                            })}
                            suffix="%"
                        />
                    )
                    : null}
                <Stats
                    label="Errors"
                    status={errors.length > 0 ? "error" : undefined}
                    value={errors.length.toLocaleString()}
                />
                <Stats
                    label="P50"
                    status={endpoint.degradedAfter
                        ? stats.p50 >= endpoint.degradedAfter ? "warn" : undefined
                        : undefined}
                    value={stats.p50.toLocaleString()}
                    suffix="ms"
                />
                <Stats
                    label="P95"
                    status={endpoint.degradedAfter
                        ? stats.p95 >= endpoint.degradedAfter ? "warn" : undefined
                        : undefined}
                    value={stats.p95.toLocaleString()}
                    suffix="ms"
                />
                <Stats
                    label="P99"
                    status={endpoint.degradedAfter
                        ? stats.p99 >= endpoint.degradedAfter ? "warn" : undefined
                        : undefined}
                    value={stats.p99.toLocaleString()}
                    suffix="ms"
                />
            </div>


            {errors.length > 0 ? <div className=" py-4 md:py-8 lg:py-16">
                <Heading h3>Errors</Heading>
                <ErrorsTable errors={errors} />
            </div>
                : null}

            {latestChecks.length > 0 ? <div className=" py-4 md:py-8 lg:py-16">
                <Heading h3>Latest Checks</Heading>
                <LatestTable checks={latestChecks} />
            </div>
                : null}

        </main>
    </div>
}
