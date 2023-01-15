import { Command, Flags, CliUx } from "@oclif/core";
import fetch from "isomorphic-fetch";
export default class Check extends Command {
	static description = "Fetch a URL and record latencies from multiple regions";

	static examples = ["<%= config.bin %> <%= command.id %>"];
	static args = [
		{
			name: "url",
		},
	];
	static flags = {
		method: Flags.enum({
			char: "m",
			default: "GET",
			multiple: false,
			description: "HTTP method",
			options: ["GET", "POST", "PUT", "DELETE", "PATCH"],
		}),
		repeat: Flags.boolean({
			char: "r",
			default: false,
			description: "Repeat the check to similate a hot cache",
		}),
		noopen: Flags.boolean({
			default: false,
			description: "Prevents your browser from being opened automatically",
		}),
	};

	public async run(): Promise<void> {
		const { args, flags } = await this.parse(Check);

		const url = args.url;

		// checks if url is valid
		new URL(url);

		CliUx.ux.action.start("Checking");

		const res = await fetch("https://planetfall.io/api/trpc/play.check", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				json: {
					url: args.url,
					method: flags.method,
					regionIds: [
						"fly:ams",
						"fly:cdg",
						"fly:den",
						"fly:dfw",
						"fly:ewr",
						"fly:fra",
						"fly:gru",
						"fly:hkg",
						"fly:iad",
						"fly:jnb",
						"fly:lax",
						"fly:lhr",
						"fly:maa",
						"fly:mad",
						"fly:mia",
						"fly:nrt",
						"fly:ord",
						"fly:otp",
						"fly:scl",
						"fly:sea",
						"fly:sin",
						"fly:sjc",
						"fly:syd",
						"fly:waw",
						"fly:yul",
						"fly:yyz",
					],
					repeat: flags.repeat,
				},
			}),
		});
		if (!res.json) {
			throw new Error(`Error: ${await res.text()}`);
		}

		const json = (await res.json()) as {
			result: { data: { json: { shareId: string } } };
		};
		const playUrl = `https://planetfall.io/play/${json.result.data.json.shareId}`;
		CliUx.ux.action.stop("Done");
		CliUx.ux.log("");

		if (!flags.noopen) {
			CliUx.ux.open(playUrl);
		}
		CliUx.ux.log("Please visit the following URL to see the results:");
		CliUx.ux.url(playUrl, playUrl);
		CliUx.ux.log("");
	}
}
