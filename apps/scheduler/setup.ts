import { z } from "zod";
import { Cache } from "./cache";

import type { Setup } from "@planetfall/db";
import { Logger } from "./logger";

const setupResponseValidation = z.object({
  url: z.string().url().optional(),
  headers: z.record(z.string()).optional(),
  body: z.string().optional(),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "OPTIONS"]).optional(),
});

export type SetupResponse = z.infer<typeof setupResponseValidation>;

export class SetupManager {
  private cache: Cache<SetupResponse>;
  private logger: Logger;

  constructor(opts: { logger: Logger }) {
    this.cache = new Cache({ ttlSeconds: 5 * 60 });
    this.logger = opts.logger;
  }

  public async getSetupResponse(endpointId: string, setup: Setup): Promise<SetupResponse> {
    const cached = this.cache.get(endpointId);
    if (cached) {
      return cached;
    }
    this.logger.info("Fetching setup instructions", {
      ...setup,
    });

    async function get(): Promise<SetupResponse> {
      const headers = new Headers({
        "Content-Type": "application/json",
      });
      for (const [key, value] of Object.entries(setup.headers as Record<string, string>)) {
        headers.set(key, value);
      }
      const res = await fetch(setup.url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          endpointId,
        }),
      });
      if (!res.ok) {
        throw new Error(`Error fetching ${setup.url}: ${await res.text()}`);
      }
      const json = await res.json();
      const validated = setupResponseValidation.safeParse(json);
      if (!validated.success) {
        throw new Error(`Malformed setup response: ${validated.error.message}`);
      }
      return validated.data;
    }

    const instructions = await get().catch((err) => {
      console.warn(err);
      return get();
    });
    this.logger.info("Received setup instructions", {
      setupId: setup.id,
      ...instructions,
    });
    return instructions;
  }
}
