import { Email } from "@planetfall/emails";
import { PrismaClient } from "@planetfall/db";
import { Logger } from "./logger";
import { Redis } from "@upstash/redis";

type ExceededFreeTier = {
  type: "exceededFreeTier";
  data: {
    teamId: string;
    time: number;
    currentUsage: number;
  };
};

export class Notifications {
  private readonly email: Email;
  private readonly db: PrismaClient;
  private readonly redis: Redis;
  private readonly logger: Logger;

  constructor(opts: {
    redis: Redis;
    email: Email;
    logger: Logger;
    db: PrismaClient;
  }) {
    this.email = opts.email;
    this.redis = opts.redis;
    this.db = opts.db;
    this.logger = opts.logger;
  }

  public async send(event: ExceededFreeTier): Promise<void> {
    const shouldSend = await this.redis.set(
      ["notifications", event.type, event.data.teamId].join(":"),
      true,
      { nx: true, ex: 14 * 24 * 60 * 60 },
    );
    if (!shouldSend) {
      return;
    }

    this.logger.info("Notifying", { teamId: event.data.teamId, event: event.type });
    const team = await this.db.team.findUnique({
      where: { id: event.data.teamId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
    if (!team) {
      console.error(`team ${event.data.teamId} not found`);
      return;
    }
    await Promise.all(
      team.members.map(async (m) => {
        await this.email.sendUsageExceeded({
          to: m.user.email,
          teamName: team.name,
          teamSlug: team.slug,
          currentUsage: event.data.currentUsage,
          maxMonthlyRequests: team.maxMonthlyRequests,
        });
      }),
    );
  }
}
