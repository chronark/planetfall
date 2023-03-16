import { render } from "@react-email/render";
import { Resend } from "resend";
import { EndpointAlert } from "./emails/EndpointAlert";
import { DebugEvent } from "./emails/DebugEvent";
import TeamInvitation from "./emails/TeamInvitation";
import { UsageExceeded } from "./emails/UsageExceeded";
import TrialEnded from "./emails/TrialEnded";
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
      from: "alerts@planetfall.io",
      to: opts.to,
      reply_to: "support@planetfall.io",
      subject: "Planetfall Endpoint Alert",
      html,
    });
  }
  public async sendDebugEvent(opts: {
    time: number;
    data: Record<string, unknown>;
  }) {
    const html = render(<DebugEvent time={opts.time} data={opts.data} />);
    return await this.client.sendEmail({
      from: "support@planetfall.io",
      to: "debug@planetfall.io",
      reply_to: "support@planetfall.io",
      subject: "Planetfall Debug Event",
      html,
    });
  }
  public async sendTeamInvitation(opts: {
    to: string;
    team: string;
    username: string;
    inviteLink: string;
    invitedFrom: string;
  }) {
    const html = render(
      <TeamInvitation
        invitedFrom={opts.invitedFrom}
        team={opts.team}
        username={opts.username}
        inviteLink={opts.inviteLink}
      />,
    );
    return await this.client.sendEmail({
      from: "andreas@planetfall.io",
      to: opts.to,
      reply_to: "support@planetfall.io",
      subject: "Planetfall Team Invitation",
      html,
    });
  }

  public async sendUsageExceeded(opts: {
    to: string;
    teamName: string;
    teamSlug: string;
    currentUsage: number;
    maxMonthlyRequests: number;
  }) {
    const html = render(
      <UsageExceeded
        teamName={opts.teamName}
        teamSlug={opts.teamSlug}
        currentUsage={opts.currentUsage}
        maxMonthlyRequests={opts.maxMonthlyRequests}
      />,
    );
    return await this.client.sendEmail({
      from: "andreas@planetfall.io",
      to: opts.to,
      reply_to: "support@planetfall.io",
      subject: "Your Planetfall Team Has Exceeded Its Monthly Usage",
      html,
    });
  }

  public async sendEndofTrial(opts: {
    to: string;
    username: string;
    teamName: string;
    teamSlug: string;
  }) {
    const html = render(
      <TrialEnded teamName={opts.teamName} teamSlug={opts.teamSlug} username={opts.username} />,
    );
    return await this.client.sendEmail({
      from: "support@planetfall.io",
      to: opts.to,
      reply_to: "support@planetfall.io",
      subject: "Your Planetfall Trial Has Ended",
      html,
    });
  }
}
