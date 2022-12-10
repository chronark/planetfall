import { MailService } from "@sendgrid/mail";
import { render } from "@react-email/render";
import { EndpointAlert } from "./emails/EndpointAlert";
export class Email {
	client: MailService;

	constructor() {
		this.client = new MailService();
		const apikey = process.env.SENDGRID_API_KEY;
		if (!apikey) {
			throw new Error("SENDGRID_API_KEY not found");
		}
		this.client.setApiKey(apikey);
	}

	public async sendSignInLink(opts: {
		to: string;
		link: string;
		from: string;
	}): Promise<void> {
		const res = await this.client.send({
			from: opts.from,
			to: opts.to,
			subject: "Planetfall Sign In",
			templateId: "d-3894fa3392f94fa385747d9f2944886b",
			dynamicTemplateData: {
				link: opts.link,
			},
		});
		if (res[0].statusCode > 300) {
			throw new Error(`unable to send email. status: ${res[0].statusCode}`);
		}
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
	}): Promise<void> {
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
		const res = await this.client.send({
			from: "chronark@planetfall.io",
			to: opts.to,
			subject: "Planetfall Endpoint Alert",
			html,
		});
		if (res[0].statusCode > 300) {
			throw new Error(`unable to send email. status: ${res[0].statusCode}`);
		}
	}
}
