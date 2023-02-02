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
	private updatedAt = 0;
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
			if (t.plan === "DISABLED") {
				this.logger.info("Skipping team with DISABLED plan", {
					teamId: t.id,
				});
				continue;
			}

			const now = new Date();
			const monthStart = new Date(now.getUTCFullYear(), now.getUTCMonth());
			const monthEnd = new Date(now.getUTCFullYear(), now.getUTCMonth() + 1);

			const billingStart =
				t.stripeCurrentBillingPeriodStart?.getTime() ?? monthStart.getTime();
			const billingEnd =
				t.stripeCurrentBillingPeriodEnd?.getTime() ?? monthEnd.getTime();

			const usage = await this.tinybird.getUsage(t.id, {
				year: now.getUTCFullYear(),
				month: now.getUTCMonth() + 1,
			});
			const totalUsage = usage.reduce((total, day) => total + day.day, 0);

			this.logger.info("evaluating team usage", {
				teamId: t.id,
				billingStart,
				billingEnd,
				usage,
			});

			if (totalUsage > t.maxMonthlyRequests) {
				this.logger.info("team has exceeded monthly requests", {
					teamId: t.id,
					maxMonthlyRequests: t.maxMonthlyRequests,
					billingStart,
					billingEnd,
					usage,
				});
				break;
			}

			for (const e of t.endpoints) {
				if (e.active) {
					want[e.id] = e;
				}
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
				team: true,
			},
		});
		if (!endpoint) {
			throw new Error(`endpoint not found: ${endpointId}`);
		}

		const usage = await this.tinybird.getUsage(endpoint.team.id, {
			year: new Date().getUTCFullYear(),
			month: new Date().getUTCMonth() + 1,
		});
		const totalUsage = usage.reduce((total, day) => total + day.day, 0);
		if (totalUsage > endpoint.team.maxMonthlyRequests) {
			return;
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
					if (region.platform==="flyRedis") {
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
						this.logger.error("endpoint test failed", {
							status: res.status,
							endpointId: endpoint.id,
							regionId: region.id,
							error: await res.text(),
						});
						return;
					}

					const parsed = (await res.json()) as {
						error?: string;
						time: number;
						status: number;
						latency?: number;
						body?: string;
						headers?: Record<string, string>;
						tags?: string[];
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
						if (!c.error) {
							if (!c.body) {
								throw new Error("no body");
							}
							if (!c.headers) {
								throw new Error("no headers");
							}

							if (endpoint.assertions) {
								const as = assertions.deserialize(endpoint.assertions);
								for (const a of as) {
									const success = a.assert({
										body: c.body,
										header: c.headers,
										status: c.status,
									});
									if (!success) {
										c.error = `Assertion error: ${JSON.stringify(a.schema)}`;
										break;
									}
								}
							}
						}

						return {
							id: newId("check"),
							source: "scheduler",
							endpointId: endpoint.id,
							teamId: endpoint.teamId,
							latency: c.latency,
							time: c.time,
							status: c.status,
							regionId,
							error: c.error,
							body: c.body,
							tags: c.tags,
							header: JSON.stringify(c.headers),
							timing: JSON.stringify(c.timing),
						};
					});
					await this.tinybird.publishChecks(data).catch((err) => {
						this.logger.error("error publishing checks", {
							endpointId: endpoint.id,
							regionId: region.id,
							error: (err as Error).message,
						});
						throw err;
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
				}),
			);
		} catch (err) {
			this.logger.error((err as Error).message);
		}
	}
}
