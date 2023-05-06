import { z } from "zod";
import { Cache } from "./cache";

import type { Setup } from "@planetfall/db";

const setupResponseValidation = z.object({
  url: z.string().url().optional(),
  headers: z.record(z.string()).optional(),
  body: z.string().optional(),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "OPTIONS"]).optional(),
});

export type SetupResponse = z.infer<typeof setupResponseValidation>;

export class SetupManager {
  private cache: Cache<SetupResponse>;

  constructor() {
    this.cache = new Cache({ ttlSeconds: 5 * 60 });
  }

  public async getSetupResponse(endpointId: string, setup: Setup): Promise<SetupResponse> {
    const cached = this.cache.get(endpointId);
    if (cached) {
      return cached;
    }

    async function get(): Promise<SetupResponse> {
      const headers = new Headers();
      for (const [key, value] of Object.entries(setup.headers as Record<string, string>)) {
        headers.set(key, value);
      }
      const res = await fetch(setup.url, {
        method: setup.method,
        headers,
        body: setup.body,
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

    return get().catch((err) => {
      console.warn(err);
      return get();
    });
  }
}
