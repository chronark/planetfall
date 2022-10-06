import { Plan } from "@planetfall/db";

export type Quota = {
  retention: number;
  maxMonthlyRequests: number | null;
};

export const DEFAULT_QUOTA: Record<
  "FREE" | "PERSONAL" | "PRO" | "ENTERPRISE",
  Quota
> = {
  "FREE": {
    retention: 1, // 1 day
    maxMonthlyRequests: 100_000,
  },
  [Plan.PERSONAL]: {
    retention: 1, // 1 day
    maxMonthlyRequests: 5_000_000,
  },
  [Plan.PRO]: {
    retention: 7, // 1 week
    maxMonthlyRequests: null,
  },
  [Plan.ENTERPRISE]: {
    retention: 90, // 30 days
    maxMonthlyRequests: null,
  },
};
