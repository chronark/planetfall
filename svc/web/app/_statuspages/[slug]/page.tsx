

import { db } from "@planetfall/db";
import { Metric, Row } from "./chart";



async function getEndpointData(endpointId: string) {
  const res = await fetch(
    `https://api.tinybird.co/v0/pipes/production__endpoint_buckets__v1.json?endpointId=${endpointId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}`,
      },
    },
  );


  const data = await res.json() as {
    data: Metric[];
  };
  const missing = 72 - data.data.length
  if (missing > 0) {
    const empty = new Array(missing).fill(
      { time: "", min: -1, max: -1, p50: -1, p95: -1, p99: -1 }
    )
    data.data = empty.concat(data.data)
  }

  return data.data
}


async function getEndpointDataByRegion(endpointId: string) {
  const res = await fetch(
    `https://api.tinybird.co/v0/pipes/production__endpoint_buckets__v1.json?endpointId=${endpointId}&byRegion=true`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}`,
      },
    },
  );


  const data = await res.json() as {
    data: (Metric & { regionId: string })[];
  };
  const missing = 72 - data.data.length
  if (missing > 0) {
    const empty = new Array(missing).fill(
      { time: "", min: -1, max: -1, p50: -1, p95: -1, p99: -1, regionId: "" }
    )
    data.data = empty.concat(data.data)
  }

  return data.data
}






import {
  ChevronDownIcon,
  MinusIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import * as Collapse from "@radix-ui/react-collapsible";
import * as HoverCard from "@radix-ui/react-hover-card";
import { Divider, Popover } from "antd";
import classNames from "classnames";
import { GetStaticPropsContext } from "next";
import React, { useEffect, useMemo, useState } from "react";
import { Area, Heatmap, Line, TinyArea } from "@ant-design/plots";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";


type Series = {
  time: number;
  latency?: number;
  error?: string;
  region: string;
}[];



export default async function Page(props: { params: { slug: string } }) {
  const statusPage = await db.statusPage.findUnique({
    where: { slug: props.params.slug },
    include: {
      endpoints: {
        include: { regions: true }
      }
    },
  });
  if (!statusPage) {
    return null;
  }


  const endpoints = await Promise.all(statusPage.endpoints.map(async (e) => {


    const regions: Record<string, Metric[]> = {}

    const metricsWithRegions = await getEndpointDataByRegion(e.id)
    for (const metric of metricsWithRegions) {
      const regionName = e.regions.find(r => r.id === metric.regionId)?.name || metric.regionId
        if (!regions[regionName]) {
          regions[regionName] = []
        }
        regions[regionName].push(metric)
    }
    for (const metrics of Object.values(regions)) {
        while (metrics.length < 72) {
          metrics.unshift({
            time: "",
            min: -1,
            max: -1,
            p50: -1,
            p95: -1,
            p99: -1,
          })
        }
    }
    return {
      id: e.id,
      degradedAfter: e.degradedAfter ?? undefined,
      name: e.name ?? undefined,
      url: e.url,
      metrics: await getEndpointData(e.id),
      regions,
    }
  }));

  return (

    <main className="container mx-auto md:py-16 ">
      <ul
        className="gap-4"
      // initial="hidden"
      // animate="show"
      // variants={{
      //   hidden: {},
      //   show: {
      //     transition: {
      //       staggerChildren: 0.1,
      //     },
      //   },
      // }}
      >
        {endpoints.map((endpoint) => (
          <li
            key={endpoint.url}
          // variants={{
          //   hidden: { scale: 0.9, opacity: 0 },
          //   show: { scale: 1, opacity: 1, transition: { type: "spring" } },
          // }}
          >
            <Row
              key={endpoint.url}
              endpoint={endpoint}
            />
          </li>
        ))}
      </ul>
    </main>

  );
}
