export class Client {
	private readonly baseUrl = "https://api.tinybird.co";
	private readonly token: string;

	constructor(token?: string) {
		token ??= process.env.TINYBIRD_TOKEN;

		if (!token) {
			throw new Error("tinybird token is missing");
		}
		this.token = token;
	}

	private async fetch<T>(
		pipe: string,
		opts?: Record<string, string | number | boolean>,
	): Promise<T> {
		const url = new URL(`/v0/pipes/${pipe}.json`, this.baseUrl);
		if (opts) {
			for (const [key, value] of Object.entries(opts)) {
				url.searchParams.set(key, String(value));
			}
		}
		const res = await fetch(url, {
			headers: { Authorization: `Bearer ${this.token}` },
		});
		if (!res.ok) {
			throw new Error(`Error reading pipe ${pipe}: ${await res.text()}`);
		}
		const json = await res.json();
		return json.data as T;
	}

	public async publish<TEvent extends Record<string, unknown>>(
		event: string,
		payload: TEvent | TEvent[],
	): Promise<void> {
		const url = new URL("/v0/events", this.baseUrl);
		url.searchParams.set("name", event);

		const body = (Array.isArray(payload) ? payload : [payload])
			.map((p) => JSON.stringify(p))
			.join("\n");
		const res = await fetch(url.toString(), {
			method: "POST",
			body,
			headers: { Authorization: `Bearer ${this.token}` },
		});
		if (!res.ok) {
			throw new Error(await res.text());
		}
	}

	public async publishChecks(checks: Check[]): Promise<void> {
		await Promise.all([
			this.publish("checks__v2", checks),
			this.publish("checks__v3", checks),
		]);
	}

	public async getEndpointStats(endpointId: string): Promise<Metric[]> {
		const data = await this.fetch<Metric[]>("get_endpoint_stats__v1", {
			endpointId,
		});

		return data.map((d) => ({
			regionId: d.regionId,
			count: d.count ?? 0,
			p50: d.p50 ?? 0,
			p95: d.p95 ?? 0,
			p99: d.p99 ?? 0,
			errors: d.errors ?? 0,
		}));
	}
	public async getEndpointStatsPerHour(
		endpointId: string,
	): Promise<MetricOverTime[]> {
		const data = await this.fetch<MetricOverTime[]>(
			"get_endpoint_stats_per_hour__v1",
			{ endpointId, days: 7 },
		);

		return data;
	}

	public async getCheckById(checkId: string): Promise<Check | null> {
		const data = await this.fetch<Check[]>("get_check_by_id__v1", { checkId });

		if (data.length === 0) {
			return null;
		}

		return data[0];
	}
	/**
	 *
	 * @param teamId
	 * @param interval - [start, end] in unix timestamp with millisecond precision
	 * @returns
	 */
	public async getUsage(
		teamId: string,
		time: {
			year: number;
			month: number;
		},
	): Promise<
		{
			teamId: string;
			usage: number;
			year: number;
			month: number;
			day: number;
		}[]
	> {
		const data = await this.fetch<
			{
				teamId: string;
				usage: number;
				year: number;
				month: number;
				day: number;
			}[]
		>("get_usage__v1", { teamId, year: time.year, month: time.month });

		return data;
	}

	public async getLatestChecksByEndpoint(
		endpointId: string,
		opts?: {
			limit?: number;
		},
	): Promise<Check[]> {
		const params: Record<string, string> = { endpointId };

		if (opts?.limit) {
			params.limit = opts.limit.toString();
		}
		const data = await this.fetch<Check[]>("checks_by_endpoint__v1", params);

		return data;
	}
}

export type Check = {
	id: string;
	endpointId: string;
	latency?: number;
	regionId: string;
	status?: number;
	teamId: string;
	// Unix timestamp with millisecond precision
	time: number;
	timing?: string;
	body?: string;
	header?: string;
	source?: string;
	error?: string;
};

export type Metric = {
	count: number;
	p50: number;
	p95: number;
	p99: number;
	errors: number;
	regionId: string;
};

export type MetricOverTime = { time: number } & Metric;
