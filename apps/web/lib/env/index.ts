import { z } from "zod";

export function address(): string {
  const isVercel = Boolean(process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL);

  const protocol = isVercel ? "https" : "http";
  const host = isVercel ? "planetfall.io" : "localhost:3000";

  return `${protocol}://${host}`;
}

const schema = z.object({
  NEXT_PUBLIC_PLAIN_APP_KEY: z.string(),
  CLERK_WEBHOOK_SECRET: z.string(),
  CLERK_SECRET_KEY: z.string(),
  VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
  VERCEL_URL: z.string().optional(),
  DATABASE_URL: z.string(),
  STRIPE_PUBLISHABLE_KEY: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  STRIPE_PRICE_ID_CHECKS: z.string(),
  TINYBIRD_TOKEN: z.string(),
  GITHUB_OAUTH_ID: z.string(),
  GITHUB_OAUTH_SECRET: z.string(),
  NEXTAUTH_SECRET: z.string(),
  UPSTASH_REDIS_REST_URL: z.string(),
  UPSTASH_REDIS_REST_TOKEN: z.string(),
  UPSTASH_KAFKA_REST_URL: z.string(),
  UPSTASH_KAFKA_REST_USERNAME: z.string(),
  UPSTASH_KAFKA_REST_PASSWORD: z.string(),
});

export const env = schema.parse(process.env);
