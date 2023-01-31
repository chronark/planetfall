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

class Cache {
	private readonly state: Map<string, number>;
	private readonly ttl: number;
	constructor() {
		this.state = new Map();
		this.ttl = 5 * 60 * 1000;
	}

	public async debounce(key: string): Promise<boolean> {
		const now = Date.now();
		const existing = this.state.get(key);
		if (existing && existing < now) {
			return false;
		}
		this.state.set(key, now + this.ttl);
		return true;
	}
}

export class Notifications {
	private readonly email: Email;
	private readonly db: PrismaClient;
	private readonly logger: Logger;
	private readonly cache: Cache;

	constructor(opts: {
		email: Email;
		db: PrismaClient;
		logger: Logger;
	}) {
		this.cache = new Cache();
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

		const shouldSend = await this.cache.debounce(debounceKey);
		if (!shouldSend) {
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
