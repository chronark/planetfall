import Axiom from "@axiomhq/axiom-node";
import * as tslog from "tslog";

export interface Logger {
	info(message: string, fields?: Record<string, unknown>): void;
	warn(message: string, fields?: Record<string, unknown>): void;
	error(message: string, fields?: Record<string, unknown>): void;
}
export function newLogger(opts?: { dataset: string }): Logger {
	const logger = new tslog.Logger();
	logger.setSettings({
		colorizePrettyLogs: process.env.NODE_ENV !== "production",
	});

	if (opts?.dataset) {
		const token = process.env.AXIOM_TOKEN;
		if (!token) {
			throw new Error("AXIOM_TOKEN is undefined");
		}
		const axiom = new Axiom({ token });

		const transport = (log: tslog.ILogObject) => {
			const event = {
				date: log.date,
				hostname: log.hostname,
				fileName: log.fileName,
				functionName: log.functionName,
				level: log.logLevel,
				version: process.env.PLANETFALL_VERSION,
				build: process.env.PLANETFALL_BUILD,
				message: log.argumentsArray[0],
				...(log.argumentsArray.length > 1 && log.argumentsArray[1]
					? log.argumentsArray[1]
					: undefined),
			};

			axiom.ingestEvents(opts.dataset, event).catch((err) => {
				console.error("Unable to ingest log event");
			});
		};
		logger.attachTransport(
			{
				silly: transport,
				debug: transport,
				trace: transport,
				info: transport,
				warn: transport,
				error: transport,
				fatal: transport,
			},
			"debug",
		);
	}

	return logger;
}
