import { AlertNotifications } from "./alerts";
import { Logger } from "./logger";
import { Notifications } from "./notifications";
import { SetupManager } from "./setup";
import * as assertions from "@planetfall/assertions";
import { Endpoint, PrismaClient, Region, Setup } from "@planetfall/db";
import { newId } from "@planetfall/id";
import { publishCheck } from "@planetfall/tinybird";
import { getUsage } from "@planetfall/tinybird";

export class Scheduler {
  // key: endpointId
  private readonly signingKey: string;
  private endpoints: Map<string, { intervalId: NodeJS.Timeout; updatedAt: number }>;
  private db: PrismaClient;
  private logger: Logger;
  private alerts: AlertNotifications;
  private notifications: Notifications;
  private setupManager: SetupManager;
  regions: Record<string, Region>;

  constructor({
    logger,
    alerts,
    notifications,
    signingKey,
  }: {
    logger: Logger;
    alerts: AlertNotifications;
    notifications: Notifications;
    signingKey: string;
  }) {
    this.db = new PrismaClient();
    this.endpoints = new Map();
    this.logger = logger;
    this.regions = {};
    this.alerts = alerts;
    this.notifications = notifications;
    this.setupManager = new SetupManager({ logger: this.logger });
    this.signingKey = signingKey;
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

    const want = new Map<string, Endpoint>();

    const teams = await this.db.team.findMany({
      where: {
        plan: {
          notIn: ["DISABLED"],
        },
      },
      include: {
        endpoints: {
          where: {
            AND: {
              active: true,
              deletedAt: null,
            },
          },
        },
      },
    });

    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;
    const usage = await getUsage({
      year,
      month,
    });

    this.logger.info("report.usage.requests.allteams", {
      month,
      year,
      requests: usage.data.reduce((sum, u) => sum + u.usage, 0),
    });

    for (const t of teams) {
      if (t.plan === "DISABLED") {
        this.logger.debug("Skipping team with DISABLED plan", {
          teamId: t.id,
          teamSlug: t.slug,
        });
        continue;
      }
      if (t.endpoints.length === 0) {
        this.logger.debug("Skipping team with no endpoints", {
          teamId: t.id,
          teamSlug: t.slug,
        });

        continue;
      }

      const totalUsage = usage.data
        .filter((u) => u.teamId === t.id)
        .reduce((sum, u) => sum + u.usage, 0);

      // report usage, to power some charts in axiom.
      this.logger.info("report.usage.requests", {
        teamId: t.id,
        teamSlug: t.slug,
        month,
        year,
        requests: totalUsage,
      });

      if (totalUsage > t.maxMonthlyRequests) {
        this.logger.info("team has exceeded monthly requests", {
          teamId: t.id,
          teamSlug: t.slug,
          maxMonthlyRequests: t.maxMonthlyRequests,
          totalUsage,
        });

        for (const e of t.endpoints) {
          this.removeEndpoint(e.id);
        }
        await this.notifications.send({
          type: "exceededFreeTier",
          data: {
            time: Date.now(),
            teamId: t.id,
            currentUsage: totalUsage,
          },
        });
      } else {
        for (const e of t.endpoints) {
          if (e.active && !e.deletedAt) {
            want.set(e.id, e);
          }
        }
      }
    }

    /**
     * Deleting endpoints that are no longer wanted or need to be updated
     */
    for (const [endpointId, { updatedAt }] of this.endpoints.entries()) {
      const wantEndpoint = want.get(endpointId);
      if (wantEndpoint) {
        this.logger.debug("endpoint is still wanted", { endpointId });
        if (wantEndpoint.updatedAt.getTime() > updatedAt) {
          this.logger.info("endpoint needs to be updated", {
            endpointId,
          });
          this.removeEndpoint(endpointId);
        }
      } else {
        this.logger.info("endpoint needs to be removed", { endpointId });
        this.removeEndpoint(endpointId);
        this.logger.info("endpoint removed", { endpointId });
      }
    }
    /**
     * Adding endpoints that are wanted but not present
     */
    for (const endpoint of want.values()) {
      const found = this.endpoints.get(endpoint.id);
      if (!found) {
        this.logger.info("endpoint needs to be added", { endpointId: endpoint.id });
        await this.addEndpoint(endpoint.id);
        this.logger.info("endpoint added", { endpointId: endpoint.id });
      }
    }

    this.logger.info("report.endpoints.active", {
      activeEndpoints: this.endpoints.size,
    });
  }

  public async addEndpoint(endpointId: string): Promise<void> {
    this.logger.info("adding new endpoint", { endpointId });
    const endpoint = await this.db.endpoint.findUnique({
      where: { id: endpointId },
      include: {
        regions: true,
        setup: true,
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

  private async testEndpoint(
    endpoint: Endpoint & { regions: Region[]; setup: Setup | null },
  ): Promise<void> {
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

      /**
       * Set default values from endpoint config
       */
      let url = endpoint.url;
      const headers: Record<string, string> = {};

      if (endpoint.headers) {
        for (const [k, v] of Object.entries(endpoint.headers as Record<string, string>)) {
          headers[k] = v;
        }
      }

      let body = endpoint.body;
      let method = endpoint.method;

      /**
       * Overwrite with dynamic setup
       */
      if (endpoint.setup) {
        const setup = await this.setupManager.getSetupResponse(endpoint.id, endpoint.setup);

        if (setup.url) {
          url = setup.url;
        }
        if (setup.headers) {
          for (const [k, v] of Object.entries(setup.headers)) {
            headers[k] = v;
          }
        }
        if (setup.body) {
          body = setup.body;
        }
        if (setup.method) {
          method = setup.method;
        }
      }

      const regions =
        endpoint.distribution === "ALL"
          ? endpoint.regions
          : [endpoint.regions[Math.floor(Math.random() * endpoint.regions.length)]];

      for await (const region of regions) {
        this.logger.info("testing endpoint", {
          endpointId: endpoint.id,
          regionId: region.id,
        });
        /**
         * checkRunnerHeaders are sent to the check runner's http handler
         * Not to the customer's endpoint
         */
        const checkRunnerHeaders = new Headers({
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        });
        if (region.platform === "fly") {
          checkRunnerHeaders.set("Fly-Prefer-Region", region.region);
        }

        const bodyStr = JSON.stringify({
          exp: Date.now() + 1000 * 60,
          url,
          method,
          headers,
          body,
          timeout: endpoint.timeout ?? undefined,
          followRedirects: endpoint.followRedirects ?? false,
          prewarm: endpoint.prewarm,
          runs: endpoint.runs,
        });
        // const signature = crypto
        //   .createHmac("sha256", this.signingKey)
        //   .update(bodyStr)
        //   .digest("hex");
        checkRunnerHeaders.set("Authorization", "Tq1Md6pyu37/113IeudUQF/6S9RTLvCtjSe2OZfIbAA=");
        const res = await fetch(region.url, {
          method: "POST",
          headers: checkRunnerHeaders,
          body: bodyStr,
          cache: "no-store",
        });
        if (res.headers.has("x-vercel-id")) {
          this.logger.info("vercel region response", {
            endpointId: endpoint.id,
            regionId: region.id,
            vercelId: res.headers.get("x-vercel-id"),
          });
        }
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
            const as = endpoint.assertions ? assertions.deserialize(endpoint.assertions) : [];
            if (as.length > 0) {
              for (const a of as) {
                const { success, message } = a.assert({
                  body: c.body ?? "",
                  header: c.headers ?? {},
                  status: c.status,
                });
                if (!success) {
                  c.error = `Assertion error: ${message}`;
                  break;
                }
              }
            } else {
              /**
               * In case no assertions have been created yet, we will apply some defaults
               * but only if there is no error, we don't want to overwrite anything
               */
              if (c.status < 200 || c.status >= 300) {
                c.error = `Default assertion error: The response status was not 2XX: ${c.status}.`;
              }
            }
          }
          const checkId = newId("check");
          this.logger.info("report.check", {
            endpointId: endpoint.id,
            latency: c.latency,
            regionId: region.id,
            checkId,
          });
          return {
            id: checkId,
            endpointId: endpoint.id,
            teamId: endpoint.teamId,
            latency: c.latency,
            time: c.time,
            status: c.status,
            regionId: region.id,
            error: c.error,
            body: c.body,
            headers: c.headers,
            timing: c.timing,
          };
        });

        await Promise.all(
          data.map((d) =>
            publishCheck({
              ...d,
              headers: d.headers ? JSON.stringify(d.headers) : undefined,
              timing: JSON.stringify(d.timing),
            }).catch((err) => {
              this.logger.error("error publishing checks to tinybird", {
                endpointId: endpoint.id,
                regionId: region.id,
                error: (err as Error).message,
              });
              throw err;
            }),
          ),
        );

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
            this.alerts
              .notify({
                type: "check",
                check: {
                  id: d.id,
                  endpointId: d.endpointId,
                  teamId: d.teamId,
                  time: d.time,
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
      }
    } catch (err) {
      this.logger.error((err as Error).message);
    }
  }
}
