import { ApiError } from "./error";
import { NextApiRequest } from "next";
import { db } from "@planetfall/db";
import { Role } from "@chronark/access";
import { hashToken, Statements } from "@planetfall/auth";

export async function getRole(req: NextApiRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new ApiError({
      status: 401,
      message: "missing authorization header",
    });
  }
  if (!authHeader.startsWith("Bearer ")) {
    throw new ApiError({ status: 401, message: "expected bearer token" });
  }
  const hash = hashToken(authHeader.replace(/^Bearer/, ""));

  const token = await db.token.findUnique({ where: { hash } });
  if (!token) {
    throw new ApiError({ status: 401, message: "token not found" });
  }
  if (token.expires && token.expires.getTime() < Date.now()) {
    await db.token.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });

    throw new ApiError({ status: 401, message: "token not found" });
  }

  return Role.fromString<Statements>(token.permissions);
}
