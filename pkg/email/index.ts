import { MailService } from "@sendgrid/mail";

export class Email {
  private client: MailService;

  constructor() {
    this.client = new MailService();
    const apikey = process.env.SENDGRID_API_KEY;
    if (!apikey) {
      throw new Error("SENDGRID_API_KEY not found");
    }
    this.client.setApiKey(apikey);
  }

  public async sendOTP(email: string, otp: string): Promise<void> {
    await this.client.send({
      to: email,
      from: "info@planetfall.io",
      subject: "Planetfall Sign In",
      templateId: "d-28daad5179b544daa9b72c20d64c81e0",
      dynamicTemplateData: {
        otp,
      },
    });
  }
}
