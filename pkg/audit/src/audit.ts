import { tb } from "@planetfall/tinybird";
import { z } from "zod";

const event = z.object({
  time: z.number().optional(),
  event: z.enum([
    "endpoint.create",
    "endpoint.update",
    "endpoint.delete",
    "team.create",
    "team.update",
    "team.plan.change",
    "team.billing_portal_opened",
    "team.delete",
    "invitation.create",
    "user.create",
    "user.update",
    "user.delete",
    "user.signin",
    "user.signout",
    "play.create",
    "page.create",
    "page.update",
    "page.delete",
  ]),
  resourceId: z.string(),
  actorId: z.string(),
  source: z.enum(["ui", "api", "cli", "trpc", "cron"]),
  tags: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
});

async function log(e: z.infer<typeof event>): Promise<void> {
  e.time ??= Date.now();
  const parsed = event.safeParse(e);
  if (!parsed.success) {
    throw new Error(`Invalid audit event: ${JSON.stringify(e)}`);
  }
  await tb.publish("audit__v1", [
    {
      time: parsed.data.time ?? Date.now(),
      event: parsed.data.event,
      resourceId: parsed.data.resourceId,
      actorId: parsed.data.actorId,
      source: parsed.data.source,
      tags: JSON.stringify(parsed.data.tags),
    },
  ]);
}

export const audit = { log };
