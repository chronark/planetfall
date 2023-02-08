import * as tslog from "tslog";

export class Logger {
	private logger: tslog.Logger<tslog.ILogObj>;

	constructor() {
		this.logger = new tslog.Logger({
			type: process.env.NODE_ENV === "production" ? "json" : "pretty",
		});
	}
	public info(message: string, fields?: Record<string, unknown>) {
		this.logger.info({ message, ...fields });
	}
	public warn(message: string, fields?: Record<string, unknown>) {
		this.logger.warn({ message, ...fields });
	}
	public error(message: string, fields?: Record<string, unknown>) {
		this.logger.error({ message, ...fields });
	}
}
