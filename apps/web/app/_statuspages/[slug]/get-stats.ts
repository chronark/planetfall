import { Endpoint } from "@prisma/client";
import { Metric } from "./chart";
import { Client as Tinybird } from "@planetfall/tinybird";

function fillSeries(series: Metric[], buckets: number): Metric[] {
	while (series.length < buckets) {
		series.unshift({
			time: -1,
			count: 0,
			min: 0,
			max: 0,
			p50: 0,
			p95: 0,
			p99: 0,
			errors: 0,
		});
	}
	return series;
}

export async function getStats(endpoint: Endpoint, maxTimeout: number) {
	const tinybird = new Tinybird();
	const regions: Record<string, Omit<Metric, "time"> & { series: Metric[] }> =
		{};

	const [endpointStats, regionStats, endpointSeries, regionsSeries] =
		await Promise.all([
			tinybird.getEndpointStats(endpoint.id),
			tinybird.getEndpointStatsPerRegion(endpoint.id),
			tinybird.getEndpointStatsPerHour(endpoint.id),
			tinybird.getEndpointStatsPerRegionPerHour(endpoint.id),
		]);

	for (const region of regionStats) {
		regions[region.regionId] = {
			...region,
			series: [],
		};
	}
	for (const metric of regionsSeries) {
		regions[metric.regionId].series.push(metric);
	}
	for (const region of Object.values(regions)) {
		region.series = fillSeries(region.series, 72);
	}

	return {
		id: endpoint.id,
		name: endpoint.name,
		url: endpoint.url,
		degradedAfter: endpoint.degradedAfter ?? undefined,
		timeout: endpoint.timeout ?? maxTimeout,
		...endpointStats,
		metrics: fillSeries(endpointSeries, 72),
		regions,
	};
}
