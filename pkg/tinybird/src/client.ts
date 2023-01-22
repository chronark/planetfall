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
		await this.publish("production__checks__v4", checks);
	}

	public async getEndpointStats(
		endpointId: string,
	): Promise<EndpointStats | null> {
		const url = new URL(
			"/v0/pipes/production__endpoint_stats_24h__v1.json",
			this.baseUrl,
		);
		url.searchParams.set("endpointId", endpointId);
		const res = await fetch(url.toString(), {
			headers: { Authorization: `Bearer ${this.token}` },
		});
		if (!res.ok) {
			throw new Error(await res.text());
		}

		const data = (await res.json()) as { data: EndpointStats[] };
		if (data.data.length === 0) {
			return null;
		}
		// Set defaults
		data.data[0].count ??= 0;
		data.data[0].min ??= 0;
		data.data[0].max ??= 0;
		data.data[0].p50 ??= 0;
		data.data[0].p95 ??= 0;
		data.data[0].p99 ??= 0;
		return data.data[0];
	}

	public async getCheckById(checkId: string): Promise<Check | null> {
		const url = new URL("/v0/pipes/check_by_id.json", this.baseUrl);
		url.searchParams.set("checkId", checkId);
		const res = await fetch(url.toString(), {
			headers: { Authorization: `Bearer ${this.token}` },
		});
		if (!res.ok) {
			throw new Error(await res.text());
		}

		const data = (await res.json()) as { data: Check[] };
		if (data.data.length === 0) {
			return null;
		}
		// Set defaults

		return data.data[0];
	}
	/**
	 *
	 * @param teamId
	 * @param interval - [start, end] in unix timestamp with millisecond precision
	 * @returns
	 */
	public async getUsage(
		teamId: string,
		interval: [number, number],
	): Promise<number> {
		const url = new URL(
			"/v0/pipes/production__usage_interval__v1.json",
			this.baseUrl,
		);
		url.searchParams.set("teamId", teamId);
		url.searchParams.set("start", interval[0].toString());
		url.searchParams.set("end", interval[1].toString());
		const res = await fetch(url.toString(), {
			headers: { Authorization: `Bearer ${this.token}` },
		});
		if (!res.ok) {
			throw new Error(await res.text());
		}

		const data = (await res.json()) as {
			data: { teamId: string; usage: number }[];
		};
		if (data.data.length === 0) {
			return 0;
		}

		return data.data[0].usage;
	}

	public async getLatestChecksByEndpoint(
		endpointId: string,
		errorsOnly?: boolean,
	): Promise<Check[]> {
		const url = new URL(
			"/v0/pipes/production__latest_checks_by_endpoint__v1.json",
			this.baseUrl,
		);
		url.searchParams.set("endpointId", endpointId);
		if (errorsOnly) {
			url.searchParams.set("errorsOnly", "true");
		}
		const res = await fetch(url.toString(), {
			headers: { Authorization: `Bearer ${this.token}` },
		});
		if (!res.ok) {
			throw new Error(await res.text());
		}

		const data = (await res.json()) as { data: Check[] };
		if (data.data.length === 0) {
			return [];
		}
		return data.data;
	}

	public async getChecks24h(endpointId: string): Promise<Check[]> {
		const url = new URL(
			"/v0/pipes/production__checks_last_24h__v1.json",
			this.baseUrl,
		);
		url.searchParams.set("endpointId", endpointId);
		const res = await fetch(url.toString(), {
			headers: { Authorization: `Bearer ${this.token}` },
		});
		if (!res.ok) {
			throw new Error(await res.text());
		}

		const data = (await res.json()) as { data: Check[] };
		if (data.data.length === 0) {
			return [];
		}
		return data.data;
	}
}

export type EndpointStats = {
	count: number;
	min: number;
	max: number;
	p50: number;
	p95: number;
	p99: number;
};
export type Check = {
	id: string;
	endpointId: string;
	latency?: number;
	regionId: string;
	status?: number;
	teamId: string;
	// unix timestamp with millisecond precision
	time: number;
	timing?: string;
	body?: string;
	header?: string;
	source?: string;
	error?: string;
};
