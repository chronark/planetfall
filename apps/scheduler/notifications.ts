import { Redis } from "@upstash/redis";
import { Email } from "@planetfall/emails";
import { PrismaClient } from "@planetfall/db";
import { Logger } from "./logger";

type NotificationEvent = {
	type: "check";
	check: {
		id: string;
		endpointId: string;
		teamId: string;
		time: number;
		error: string;
	};
};

export class Notifications {
	private readonly redis: Redis;
	private readonly email: Email;
	private readonly db: PrismaClient;
	private readonly debounceInterval = 600; // 10 minutes in seconds, because redis ttl is in seconds
	private readonly logger: Logger;

	constructor(opts: {
		redis: Redis;
		email: Email;
		db: PrismaClient;
		logger: Logger;
	}) {
		this.redis = opts.redis;
		this.email = opts.email;
		this.db = opts.db;
		this.logger = opts.logger;
	}

	public async notify(event: NotificationEvent): Promise<void> {
		const debounceKey = [
			"notifications",
			"debounce",
			event.check.teamId,
			event.check.endpointId,
		].join(":");

		const res = await this.redis.set(debounceKey, "true", {
			nx: true,
			ex: this.debounceInterval,
		});
		if (res === null) {
			this.logger.info("debounced:", { debounceKey });
			return;
		}
		this.logger.info("Notifying", { teamId: event.check.teamId });
		const endpoint = await this.db.endpoint.findUnique({
			where: {
				id: event.check.endpointId,
			},
		});
		if (!endpoint) {
			throw new Error("endpoint not found");
		}

		const team = await this.db.team.findUnique({
			where: {
				id: event.check.teamId,
			},
			include: {
				members: {
					include: {
						user: true,
					},
				},
			},
		});
		if (!team) {
			throw new Error("team not found");
		}

		await Promise.all(
			team.members.map(async (member) => {
				await this.email.sendEndpointAlert({
					to: member.user.email,
					time: event.check.time,
					error: event.check.error,
					teamSlug: team.slug,
					endpointName: endpoint.name,
					endpointId: endpoint.id,
					checkLink: `https://planetfall.io/${team.slug}/checks/${event.check.id}`,
				});
			}),
		);
	}
}
