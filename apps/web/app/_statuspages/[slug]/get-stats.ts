import { Endpoint } from "@prisma/client";
import { getEndpointStatsPerDay, getEndpointStats } from "@planetfall/tinybird";

export async function getStats(endpoint: Endpoint) {
  const regions: Record<
    string,
    {
      regionId: string;
      metrics: {
        count: number;
        p75: number;
        p90: number;
        p95: number;
        p99: number;
        errors: number;
        regionId: string;
      };
      series: {
        time: number;
        count: number;
        p75: number;
        p90: number;
        p95: number;
        p99: number;
        errors: number;
        regionId: string;
      }[];
    }
  > = {};

  const [endpointStats, endpointSeries] = await Promise.all([
    getEndpointStats({ endpointId: endpoint.id }),
    getEndpointStatsPerDay({ endpointId: endpoint.id }),
  ]);

  for (const metrics of endpointStats.data) {
    regions[metrics.regionId] = {
      regionId: metrics.regionId,
      metrics,
      series: [],
    };
  }
  for (const s of endpointSeries.data) {
    if (regions[s.regionId]) {
      regions[s.regionId].series.push({
        regionId: s.regionId,
        time: s.time,
        count: s.count ?? 0,
        p75: s.p75 ?? 0,
        p90: s.p90 ?? 0,
        p95: s.p95 ?? 0,
        p99: s.p99 ?? 0,
        errors: s.errors ?? 0,
      });
    }
  }

  return Object.values(regions);
}
