import { Plan } from "@planetfall/db";

export type Quota = {
  retention: number;
  maxMonthlyRequests: number | null;
};

export const DEFAULT_QUOTA: Record<"FREE" | "PRO" | "ENTERPRISE", Quota> = {
  [Plan.FREE]: {
    retention: 1, // 1 day
    maxMonthlyRequests: 100_000,
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
