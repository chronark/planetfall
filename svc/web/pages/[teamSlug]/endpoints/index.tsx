import { Layout } from "../../../components/app/layout/nav";
import { useSession, useUser } from "components/auth";
import { useRouter } from "next/router";
import { trpc } from "../../../lib/hooks/trpc";
import ms from "ms";
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
import { Loading } from "@planetfall/svc/web/components/loading";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { checkServerIdentity } from "node:tls";
import { checkIsManualRevalidate } from "next/dist/server/api-utils";
import { mkdirSync } from "node:fs";

export const Item: React.FC<{ endpointId: string; i: number }> = (
  { endpointId, i },
): JSX.Element => {
  useSession();
  const router = useRouter();
  const teamSlug = router.query.teamSlug as string;
  const ctx = trpc.useContext();
  const deleteEndpoint = trpc.endpoint.delete.useMutation({
    onSuccess: () => {
      ctx.endpoint.list.invalidate();
    },
  });
  const since = useMemo(() => Date.now() - 24 * 60 * 60 * 1000, []);
  const endpoint = trpc.endpoint.get.useQuery({ endpointId });
  const checks = trpc.check.list.useQuery({ endpointId, since });

  const errorRate = useMemo(() => {
    if (!checks.data || checks.data.length === 0) {
      return 0;
    }

    return checks.data.filter((c) => c.error).length / checks.data.length;
  }, [checks.data]);
  const latencies = useMemo(
    () =>
      (checks.data ?? []).filter((c) => typeof c.latency === "number").map((
        c,
      ) => c.latency) as number[],
    [
      checks.data,
    ],
  );
  const p50 = usePercentile(
    0.5,
    latencies,
  );
  const p95 = usePercentile(
    0.95,
    latencies,
  );
  const p99 = usePercentile(
    0.99,
    latencies,
  );
  return (
    <tr>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
        <div className="ml-4">
          <div className="font-medium text-slate-900">
            {endpoint.data?.name}
          </div>
          <div className="text-slate-500">{endpoint.data?.url}</div>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
        {endpoint.data ? ms(endpoint.data?.interval) : null}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
        <span
          className={classNames(
            "inline-flex rounded-full  px-2 text-xs font-semibold leading-5",
            {
              "bg-emerald-100 text-emerald-800": errorRate === 0,
              "bg-orange-100 text-orange-800": errorRate > 0 &&
                errorRate <= 0.01,
              "bg-red-100 text-red-800": errorRate > 0.01,
            },
          )}
        >
          {(((1 - errorRate) * 100).toPrecision(3)).toLocaleString()}%
        </span>
      </td>
      <td
        className={`whitespace-nowrap px-3 py-4 text-sm ${
          endpoint.data?.degradedAfter && p50 >= endpoint.data.degradedAfter
            ? "text-red-500"
            : "text-slate-500"
        }`}
      >
        {p50.toLocaleString()} <span className="text-slate-500">ms</span>
      </td>
      <td
        className={`whitespace-nowrap px-3 py-4 text-sm ${
          endpoint.data?.degradedAfter && p95 >= endpoint.data.degradedAfter
            ? "text-red-500"
            : "text-slate-500"
        }`}
      >
        {p95.toLocaleString()} <span className="text-slate-500">ms</span>
      </td>
      <td
        className={`whitespace-nowrap px-3 py-4 text-sm ${
          endpoint.data?.degradedAfter && p99 >= endpoint.data.degradedAfter
            ? "text-red-500"
            : "text-slate-500"
        }`}
      >
        {p99.toLocaleString()} <span className="text-slate-500">ms</span>
      </td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm  font-medium sm:pr-6">
        <Link
          href={`/${teamSlug}/endpoints/${endpointId}`}
          className="text-slate-400 hover:text-slate-900"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </Link>
      </td>
    </tr>
  );
};

export default function EndpointsPage() {
  const { user } = useUser();

  const router = useRouter();
  const breadcrumbs = user?.name ? [] : [];
  const teamSlug = router.query.teamSlug as string;
  const endpoints = trpc.endpoint.list.useQuery({
    teamSlug,
  });
  return (
    <Layout breadcrumbs={breadcrumbs}>
      <div>
        <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-slate-900">Endpoints</h1>
            <p className="mt-2 text-sm text-slate-700">
              A list of all your endpoints and their performance over the last
              24h.
            </p>
          </div>
          <div className="mt-3 flex sm:mt-0 sm:ml-4">
            {
              /* <button
              type="button"
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Share
            </button> */
            }
            <Link
              href=""
              className="transition-all hover:cursor-pointer whitespace-nowrap md:px-4 py-2 font-medium inline-flex items-center justify-center md:border border-slate-900 rounded leading-snug duration-300 ease-in-out md:bg-slate-900 md:text-slate-50 md:hover:bg-slate-50 hover:text-slate-900  shadow-sm group"
            >
              Create new endpoint
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col">
          <div className="">
            <div className="inline-block min-w-full py-2 align-middle">
              <div className="rounded">
                <table
                  className="min-w-full border-separate"
                  style={{ borderSpacing: 0 }}
                >
                  <thead className="">
                    <tr>
                      <th
                        scope="col"
                        className="sticky top-0 bg-white z-10 rounded-l border-l border-t border-b border-slate-400  py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6 lg:pl-8"
                      >
                        Endpoint
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 bg-white z-10  border-t border-b border-slate-400 hidden  px-3 py-3.5 text-left text-sm font-semibold text-slate-900 sm:table-cell"
                      >
                        Interval
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 bg-white z-10  border-t border-b border-slate-400 hidden  px-3 py-3.5 text-left text-sm font-semibold text-slate-900 lg:table-cell"
                      >
                        Availability
                      </th>

                      <th
                        scope="col"
                        className="sticky top-0 bg-white z-10  border-t border-b border-slate-400  px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                      >
                        P50
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 bg-white z-10  border-t border-b border-slate-400  px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                      >
                        P95
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 bg-white z-10  border-t border-b border-slate-400  px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                      >
                        P99
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 bg-white z-10 rounded-r border-r border-t border-b border-slate-400  py-3.5 pr-4 pl-3 sm:pr-6 lg:pr-8"
                      >
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {endpoints.data?.map((e, i) => (
                      <Item key={e.id} endpointId={e.id} i={i} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
