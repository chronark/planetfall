import { render } from "@react-email/render";
import { Resend } from "resend";

const resend = new Resend("re_Acn8wxyP_LRNZqKNH3urk72y5but6snLT");
import { EndpointAlert } from "./emails/EndpointAlert";
export class Email {
	private client: Resend;

	constructor() {
		const resendApiKey = process.env.RESEND_API_KEY;
		if (!resendApiKey) {
			throw new Error("RESEND_API_KEY not found");
		}
		this.client = new Resend(resendApiKey);
	}

	public async sendEndpointAlert(opts: {
		to: string;
		time: number;
		error: string;
		teamSlug: string;
		endpointId: string;
		endpointName: string;
		/**
		 * The url to the failed check
		 */
		checkLink: string;
	}) {
		const html = render(
			<EndpointAlert
				checkLink={opts.checkLink}
				time={opts.time}
				error={opts.error}
				teamSlug={opts.teamSlug}
				endpointId={opts.endpointId}
				endpointName={opts.endpointName}
			/>,
		);
		return await this.client.sendEmail({
			from: "chronark@planetfall.io",
			to: opts.to,
			subject: "Planetfall Endpoint Alert",
			html,
		});
	}
}
