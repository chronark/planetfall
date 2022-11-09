import { Plan } from "@planetfall/db";
import ms from "ms";

export type Quota = {
  // visible to user
  // internally we always store checks for at least a month, for billing
  retention: number;
  includedRequests: number;
  maxMonthlyRequests: number;
  maxEndpoints: number;
  minInterval: number; // in milliseconds
  maxTimeout: number; // in milliseconds
};

export type Tier = "FREE" | "PERSONAL" | "PRO" | "ENTERPRISE";
export const DEFAULT_QUOTA: Record<Tier, Quota> = {
  "FREE": {
    retention: ms("1d"), // 1 day
    includedRequests: 100_000,
    maxMonthlyRequests: 100_000,
    maxEndpoints: 5,
    minInterval: ms("10s"),
    maxTimeout: ms("2s"),
  },
  [Plan.PERSONAL]: {
    retention: ms("1d"),
    includedRequests: 100_000,

    maxMonthlyRequests: 1_000_000,
    maxEndpoints: 5,
    minInterval: ms("10s"),
    maxTimeout: ms("5s"),
  },
  [Plan.PRO]: {
    retention: ms("7d"),
    includedRequests: 100_000,
    maxMonthlyRequests: 5_000_000,
    maxEndpoints: 100,
    minInterval: ms("1s"),
    maxTimeout: ms("10s"),
  },
  [Plan.ENTERPRISE]: {
    retention: ms("90d"),
    includedRequests: 1_000_000,
    maxMonthlyRequests: 100_000_000,
    maxEndpoints: 1_000,
    minInterval: ms("1s"),
    maxTimeout: ms("30s"),
  },
};
