import { Plan } from "@planetfall/db";

export type Quota = {
  retention: number;
  maxMonthlyRequests: number | null;
};

export const DEFAULT_QUOTA: Record<Plan, Quota> = {
  [Plan.FREE]: {
    retention: 24 * 60 * 60 * 1000, // 1 day
    maxMonthlyRequests: 100_000,
  },
  [Plan.PRO]: {
    retention: 7 * 24 * 60 * 60 * 1000, // 1 week
    maxMonthlyRequests: null,
  },
  [Plan.ENTERPRISE]: {
    retention: 90 * 24 * 60 * 60 * 1000, // 30 days
    maxMonthlyRequests: null,
  },
};

export const STRIPE_PLAN_PRO_PRICE_ID = "price_1LpCUaKIlgKKsiL6137CrJhx";
