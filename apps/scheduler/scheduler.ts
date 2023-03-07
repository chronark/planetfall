import { Endpoint, PrismaClient, Region, Team } from "@planetfall/db";
import * as tb from "@planetfall/tinybird";
import { newId } from "@planetfall/id";
import { Logger } from "./logger";
import * as assertions from "@planetfall/assertions";
import { Notifications } from "./notifications";
import { Stripe } from "stripe";

export class Scheduler {
  // key: endpointId
  private endpoints: Map<string, { updatedAt: number; intervalId: NodeJS.Timeout }>;
  private db: PrismaClient;
  private updatedAt = 0;
  private logger: Logger;
  private tinybird: tb.Client;
  private notifications: Notifications;
  regions: Record<string, Region>;
  private readonly stripe: Stripe;

  constructor({ logger, notifications }: { logger: Logger; notifications: Notifications }) {
    this.db = new PrismaClient();
    this.tinybird = new tb.Client();
    this.endpoints = new Map();
    this.logger = logger;
    this.regions = {};
    this.notifications = notifications;
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2022-11-15",
      typescript: true,
    });
  }

  public async run() {
    await this.syncEndpoints();
    setInterval(() => this.syncEndpoints(), 60 * 1000);
    setInterval(() => {
      this.regions = {};
    }, 5 * 60 * 1000);
  }

  public async syncEndpoints(): Promise<void> {
    this.logger.warn("Syncing endpoints");

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
      if (t.endpoints.length === 0) {
        this.logger.info("Skipping team with no endpoints", {
          teamId: t.id,
        });
        continue;
      }

      const now = new Date();

      const usage = await this.tinybird.getUsage(t.id, {
        year: now.getUTCFullYear(),
        month: now.getUTCMonth() + 1,
      });
      const totalUsage = usage.reduce((sum, u) => sum + u.usage, 0);

      this.logger.debug("evaluating team usage", {
        teamId: t.id,
        totalUsage,
      });

      if (totalUsage > t.maxMonthlyRequests) {
        this.logger.info("team has exceeded monthly requests", {
          teamId: t.id,
          maxMonthlyRequests: t.maxMonthlyRequests,
          totalUsage,
        });

        continue;
      }

      for (const e of t.endpoints) {
        if (e.active) {
          want[e.id] = e;
        }
      }
    }

    for (const endpointId of Object.keys(this.endpoints)) {
      if (!want[endpointId]) {
        this.logger.info("endpoint needs to be removed", { endpointId });
        this.removeEndpoint(endpointId);
        this.logger.info("endpoint removed", { endpointId });
      }
    }

    for (const endpoint of Object.values(want)) {
      const active = this.endpoints.get(endpoint.id);
      if (!active) {
        this.logger.info("endpoint needs to be added", { endpointId: endpoint.id });
        await this.addEndpoint(endpoint.id);
        this.logger.info("endpoint added", { endpointId: endpoint.id });
        continue;
      }

      if (endpoint.updatedAt.getTime() > active.updatedAt) {
        this.logger.info("endpoint needs to be updated", {
          endpointId: endpoint.id,
          updatedAt: endpoint.updatedAt,
          activeUpdatedAt: active.updatedAt,
        });
        this.removeEndpoint(endpoint.id);
        await this.addEndpoint(endpoint.id);
        this.logger.info("endpoint updated", { endpointId: endpoint.id });
      }
    }

    this.logger.warn("Synced endpoints", {
      totalEndpoints: this.endpoints.size,
    });
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
    const intervalId = setInterval(() => this.testEndpoint(endpoint), endpoint.interval);
    this.endpoints.set(endpoint.id, { updatedAt: endpoint.updatedAt.getTime(), intervalId });
  }

  public removeEndpoint(endpointId: string): void {
    this.logger.info("removing endpoint", { endpointId });

    const endpoint = this.endpoints.get(endpointId);
    if (endpoint) {
      clearInterval(endpoint.intervalId);
      this.endpoints.delete(endpointId);
    }
  }

  private async testEndpoint(endpoint: Endpoint & { regions: Region[] }): Promise<void> {
    try {
      if (endpoint.regions.length === 0) {
        this.logger.info("endpoint has no regions, disabling it..", {
          endpointId: endpoint.id,
        });
        await this.db.endpoint.update({
          where: { id: endpoint.id },
          data: {
            active: false,
          },
        });
        this.removeEndpoint(endpoint.id);
        return;
      }
      const regions =
        endpoint.distribution === "ALL"
          ? endpoint.regions
          : [endpoint.regions[Math.floor(Math.random() * endpoint.regions.length)]];
      this.logger.debug("testing endpoint", {
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
          this.logger.debug("testing endpoint", {
            endpointId: endpoint.id,
            regionId: region.id,
          });

          const headers = new Headers({
            "Content-Type": "application/json",
          });
          if (region.platform === "flyRedis") {
            headers.set("Fly-Prefer-Region", region.region);
          }

          const res = await fetch(region.url, {
            method: "POST",
            headers,
            body: JSON.stringify({
              urls: [endpoint.url],
              method: endpoint.method,
              headers: endpoint.headers,
              body: endpoint.body ?? undefined,
              timeout: endpoint.timeout ?? undefined,
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
                c.body = "";
              }
              if (!c.headers) {
                c.headers = {};
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
              endpointId: endpoint.id,
              teamId: endpoint.teamId,
              latency: c.latency,
              time: new Date(c.time),
              status: c.status,
              regionId,
              error: c.error,
              body: c.body,
              header: c.headers,
              timing: c.timing,
            };
          });
          for (const d of data) {
            this.logger.debug("storing check", { checkId: d.id });
          }

          for (const d of data) {
            const responseHeaders = new Headers(d.header);
            this.tinybird.publish("cache_headers__v1", {
              time: d.time.getTime(),
              checkId: d.id,
              endpointId: d.endpointId,
              "Cache-Control": responseHeaders.get("Cache-Control"),
              "X-Vercel-Cache": responseHeaders.get("X-Vercel-Cache"),
              "Server": responseHeaders.get("Server"),

            })
          }

          await this.db.check.createMany({ data }).catch((err) => {
            this.logger.error("error publishing checks to planetscale", {
              endpointId: endpoint.id,
              regionId: region.id,
              error: (err as Error).message,
            });
            throw err;
          });
          await this.tinybird
            .publishChecks(
              data.map((d) => ({
                id: d.id,
                endpointId: d.endpointId,
                teamId: d.teamId,
                latency: d.latency,
                time: d.time.getTime(),
                error: d.error,
                regionId: d.regionId,
                status: d.status,
              })),
            )
            .catch((err) => {
              this.logger.error("error publishing checks to tinybird", {
                endpointId: endpoint.id,
                regionId: region.id,
                error: (err as Error).message,
              });
              throw err;
            });
          for (const d of data) {
            if (d.error) {
              this.logger.info("emitting notification event", {
                check: {
                  id: d.id,
                  endpointId: d.endpointId,
                  teamId: d.teamId,
                  time: d.time,
                  error: d.error,
                },
              });
              this.notifications
                .notify({
                  type: "check",
                  check: {
                    id: d.id,
                    endpointId: d.endpointId,
                    teamId: d.teamId,
                    time: d.time.getTime(),
                    error: d.error,
                  },
                })
                .catch((err) => {
                  this.logger.error("Unable to send notification", {
                    endpointId: d.endpointId,
                    teamId: d.teamId,
                    error: (err as Error).message,
                    checkId: d.id,
                  });
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
