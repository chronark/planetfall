import { Email } from "@planetfall/emails/dist/client";
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

const backoff = [
	60 * 1000, // 1 minute
	60 * 5 * 1000, // 5 minutes
	60 * 10 * 1000, // 10 minutes
	60 * 30 * 1000, // 30 minutes
	60 * 60 * 1000, // 1 hour
	60 * 60 * 2 * 1000, // 2 hours
	60 * 60 * 4 * 1000, // 4 hours
	60 * 60 * 8 * 1000, // 8 hours
	60 * 60 * 24 * 1000, // 1 day
];

type Window = {
	index: number;
	events: NotificationEvent[];
};

class Queue {
	private readonly windows = new Map<string, Window>();
	private readonly sendEvents: (events: NotificationEvent[]) => Promise<void>;
	private readonly logger: Logger;

	constructor(opts: {
		logger: Logger;
		sendEvents: (events: NotificationEvent[]) => Promise<void>;
	}) {
		this.sendEvents = opts?.sendEvents;
		this.logger = opts.logger;
	}

	public async add(key: string, evt: NotificationEvent) {
		this.logger.info("Adding event to queue", { key, evt });
		const window = this.windows.get(key);
		if (window) {
			window.events.push(evt);
			return;
		}

		this.logger.info("Opening new window", { key });
		this.openWindow(key, 0);
		await this.sendEvents([evt]);
	}
	private openWindow(key: string, index: number): void {
		this.windows.set(key, {
			index,
			events: [],
		});
		setTimeout(() => this.closeWindow(key), backoff[0]);
	}

	/**
	 * Close the window. If there were events in the window, send them and open a new window.
	 */
	private async closeWindow(key: string): Promise<void> {
		this.logger.info("Closing window", { key });
		const window = this.windows.get(key);
		if (!window) {
			return;
		}
		if (window.events.length === 0) {
			this.windows.delete(key);
			return;
		}

		this.openWindow(key, window.index + 1);
		this.logger.info("dequeuing events", { key, events: window.events });
		this.sendEvents(window.events);
	}
}
export class Notifications {
	private readonly email: Email;
	private readonly db: PrismaClient;
	private readonly logger: Logger;

	private readonly queue: Queue;

	constructor(opts: {
		email: Email;
		db: PrismaClient;
		logger: Logger;
	}) {
		this.email = opts.email;
		this.db = opts.db;
		this.logger = opts.logger;
		this.queue = new Queue({
			logger: opts.logger,
			sendEvents: (events) => this.sendEvents(events),
		});
	}

	private async sendEvents(events: NotificationEvent[]): Promise<void> {
		const event = events.at(-1);
		if (!event) {
			this.logger.error("No events to send");
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
				await this.email
					.sendEndpointAlert({
						to: member.user.email,
						time: event.check.time,
						error: event.check.error,
						teamSlug: team.slug,
						endpointName: endpoint.name,
						endpointId: endpoint.id,
						checkLink: `https://planetfall.io/${team.slug}/checks/${event.check.id}`,
					})
					.catch((err: Error) => {
						this.logger.error("Error sending email", {
							error: err.message,
							teamId: team.id,
							userId: member.userId,
							endpointId: endpoint.id,
						});
					});
			}),
		);
	}
	public async notify(event: NotificationEvent): Promise<void> {
		const debounceKey = [
			"notifications",
			event.check.teamId,
			event.check.endpointId,
		].join(":");

		await this.queue.add(debounceKey, event);
	}
}
