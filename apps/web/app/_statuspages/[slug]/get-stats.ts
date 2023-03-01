import { Endpoint } from "@prisma/client";
import {
	Client as Tinybird,
	Metric,
	MetricOverTime,
} from "@planetfall/tinybird";

export async function getStats(endpoint: Endpoint) {
	const tinybird = new Tinybird();
	const regions: Record<string, { metrics: Metric; series: MetricOverTime[] }> =
		{};

	const [endpointStats, endpointSeries] = await Promise.all([
		tinybird.getEndpointStats(endpoint.id),
		tinybird.getEndpointStatsPerHour(endpoint.id),
	]);

	for (const metrics of endpointStats) {
		regions[metrics.regionId] = {
			metrics,
			series: [],
		};
	}
	for (const s of endpointSeries) {
		regions[s.regionId].series.push({
			regionId: s.regionId,
			time: s.time,
			count: s.count ?? 0,
			p50: s.p50 ?? 0,
			p95: s.p95 ?? 0,
			p99: s.p99 ?? 0,
			errors: s.errors ?? 0,
		});
	}
	console.log(regions.global.series);

	return regions;
}
