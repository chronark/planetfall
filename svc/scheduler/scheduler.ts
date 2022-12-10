import { Endpoint, PrismaClient, Region } from "@planetfall/db";
import * as tb from "@planetfall/tinybird";
import { newId } from "@planetfall/id";
import { Logger } from "./logger";
import * as assertions from "@planetfall/assertions";
import { z } from "zod";
import ms from "ms";
import { Notifications } from "./notifications";

export class Scheduler {
	// Map of endpoint id -> clearInterval function
	private clearIntervals: Map<string, () => void>;
	private db: PrismaClient;
	private updatedAt: number = 0;
	private logger: Logger;
	private tinybird: tb.Client;
	private notifications: Notifications;
	regions: Record<string, Region>;

	constructor({
		logger,
		notifications,
	}: { logger: Logger; notifications: Notifications }) {
		this.db = new PrismaClient();
		this.tinybird = new tb.Client();
		this.clearIntervals = new Map();
		this.logger = logger;
		this.regions = {};
		this.notifications = notifications;
		setInterval(() => {
			this.regions = {};
		}, 5 * 60 * 1000);
	}

	public async syncEndpoints(): Promise<void> {
		this.logger.info("Syncing endpoints");
		const now = new Date();

		const want: Record<string, Endpoint> = {};

		const teams = await this.db.team.findMany({
			where: {
				plan: {
					notIn: ["DISABLED"],
				},
			},
			include: {
				endpoints: true,
			},
		});
		for (const t of teams) {
			const since =
				t.stripeCurrentBillingPeriodStart ??
				new Date(now.getUTCFullYear(), now.getUTCMonth());
			const usage = 0; // FIXME:
			if (usage > t.maxMonthlyRequests) {
				this.logger.info("team has exceeded monthly requests", {
					teamId: t.id,
					maxMonthlyRequests: t.maxMonthlyRequests,
					since,
					usage,
				});
				break;
			}

			for (const e of t.endpoints) {
				want[e.id] = e;
			}
		}

		for (const endpointId of Object.keys(this.clearIntervals)) {
			if (!want[endpointId]) {
				this.removeEndpoint(endpointId);
			}
		}

		for (const endpoint of Object.values(want)) {
			if (endpoint.id in this.clearIntervals) {
				// if it was updated since the last time
				if (endpoint.updatedAt.getTime() > this.updatedAt) {
					this.removeEndpoint(endpoint.id);
					this.addEndpoint(endpoint.id);
				}
			} else {
				this.addEndpoint(endpoint.id);
			}
		}

		this.updatedAt = now.getTime();
	}

	public async addEndpoint(endpointId: string): Promise<void> {
		this.logger.info("adding new endpoint", { endpointId });
		const endpoint = await this.db.endpoint.findUnique({
			where: { id: endpointId },
			include: {
				regions: true,
			},
		});
		if (!endpoint) {
			throw new Error(`endpoint not found: ${endpointId}`);
		}
		this.removeEndpoint(endpoint.id);
		this.testEndpoint(endpoint);
		const intervalId = setInterval(
			() => this.testEndpoint(endpoint),
			endpoint.interval,
		);
		this.clearIntervals.set(endpoint.id, () => clearInterval(intervalId));
	}

	public removeEndpoint(endpointId: string): void {
		this.logger.info("removing endpoint", { endpointId });

		if (this.clearIntervals.has(endpointId)) {
			this.clearIntervals.get(endpointId)!();
			this.clearIntervals.delete(endpointId);
		}
	}

	private async testEndpoint(
		endpoint: Endpoint & { regions: Region[] },
	): Promise<void> {
		try {
			if (endpoint.regions.length === 0) {
				throw new Error(`endpoint ${endpoint.id} has no active regions`);
			}
			const regions =
				endpoint.distribution === "ALL"
					? endpoint.regions
					: [
							endpoint.regions[
								Math.floor(Math.random() * endpoint.regions.length)
							],
					  ];
			this.logger.info("testing endpoint", {
				endpointId: endpoint.id,
				regions: regions.map((r) => r.id),
			});

			await Promise.all(
				regions.map(async ({ id: regionId }) => {
					let region = this.regions[regionId];
					if (!region) {
						const res = await this.db.region.findUnique({
							where: { id: regionId },
						});
						if (!res) {
							throw new Error(`region not found: ${regionId}`);
						}
						region = res;
						this.regions[regionId] = res;
					}
					this.logger.info("testing endpoint", {
						endpointId: endpoint.id,
						regionId: region.id,
					});

					const headers = new Headers({
						"Content-Type": "application/json",
					});
					if (region.platform === "fly") {
						headers.set("Fly-Prefer-Region", region.region);
					}
					const res = await fetch(region.url, {
						method: "POST",
						headers,
						body: JSON.stringify({
							url: endpoint.url,
							method: endpoint.method,
							headers: endpoint.headers,
							body: endpoint.body ?? undefined,
							timeout: endpoint.timeout ?? undefined,
							checks: 1,
						}),
					});
					if (res.status !== 200) {
						const { error } = z
							.object({
								error: z.object({
									code: z.literal("REQUEST_TIMEOUT"),
									message: z.string(),
								}),
							})
							.parse(await res.json());
						switch (error.code) {
							case "REQUEST_TIMEOUT": {
								this.logger.info("Request timeout exceeded", {
									teamId: endpoint.teamId,
									endpointId: endpoint.id,
									url: endpoint.url,
									timeout: endpoint.timeout,
								});
								await this.tinybird.publishChecks([
									{
										source: "scheduler",
										id: newId("check"),
										endpointId: endpoint.id,
										teamId: endpoint.teamId,
										time: Date.now(),
										regionId,
										error: `timeout exceeded: ${ms(endpoint.timeout ?? 0)}`,
									},
								]);
								return;
							}

							default:
								throw new Error(`Unhandled error from pinger: ${error.code}`);
						}
					}

					const parsed = (await res.json()) as {
						time: number;
						status: number;
						latency: number;
						body: string;
						headers: Record<string, string>;
						timing: {
							dnsStart: number;
							dnsDone: number;
							connectStart: number;
							connectDone: number;
							firstByteStart: number;
							firstByteDone: number;
							tlsHandshakeStart: number;
							tlsHandshakeDone: number;
						};
					}[];

					const data = parsed.map((c) => {
						let error: string | undefined = undefined;

						if (endpoint.assertions) {
							const as = assertions.deserialize(endpoint.assertions);
							for (const a of as) {
								const success = a.assert({
									body: c.body,
									header: c.headers,
									status: c.status,
								});
								if (!success) {
									error = `Assertion error: ${JSON.stringify(a.schema)}`;
									break;
								}
							}
						}

						return {
							source: "scheduler",
							id: newId("check"),
							endpointId: endpoint.id,
							teamId: endpoint.teamId,
							latency: c.latency,
							time: c.time,
							status: c.status,
							regionId,
							error,
							body: c.body,
							header: JSON.stringify(c.headers),
							timing: JSON.stringify(c.timing),
						};
					});
					for (const d of data) {
						if (d.error) {
							this.notifications.notify({
								type: "check",
								check: {
									id: d.id,
									endpointId: d.endpointId,
									teamId: d.teamId,
									time: d.time,
									error: d.error,
								},
							});
						}
					}

					await this.tinybird.publishChecks(data);
				}),
			);
		} catch (err) {
			this.logger.error((err as Error).message);
		}
	}
}
