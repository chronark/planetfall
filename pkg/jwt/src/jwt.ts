import jwt from "jsonwebtoken";
import { z } from "zod";
import { newId } from "@planetfall/id";

const issuer = "planetfall.io" as const;

export const payloadSchema = z.object({
  sub: z.string(),
  exp: z.number(),
  iat: z.number(),
  iss: z.literal(issuer),
  aud: z.string(),
  jti: z.string(),
});

export class Signer {
  private readonly privateKey: string;

  constructor(privateKey: string) {
    this.privateKey = privateKey;
  }

  public async sign(payload: {
    sub: string;
    aud: string;
  }): Promise<string> {
    return jwt.sign({}, this.privateKey, {
      jwtid: newId("jwt"),
      issuer,
      audience: payload.aud,
      subject: payload.sub,
      algorithm: "RS256",
      expiresIn: 300,
    });
  }
}

export class Verifier {
  private readonly publicKey: string;

  constructor(publicKey: string) {
    this.publicKey = publicKey;
  }

  public async verify(
    token: string,
    v: { subject: string; audience: string },
  ): Promise<
    { valid: true; payload: z.infer<typeof payloadSchema> } | { valid: false; error: string }
  > {
    const res = jwt.verify(token, this.publicKey, {
      algorithms: ["RS256"],
      issuer,
      audience: v.audience,
      subject: v.subject,
    });

    if (typeof res === "string") {
      return { valid: false, error: res };
    }
    return { valid: true, payload: payloadSchema.parse(res) };
  }
}
