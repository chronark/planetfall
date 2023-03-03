import { ApiError } from "./error";
import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@planetfall/db";
import { Role } from "@chronark/access";
import { hashToken, roles, Statements } from "lib/auth";
import { getAuth } from "@clerk/nextjs/server";

export async function getRole(req: NextApiRequest, _res: NextApiResponse) {
  const { userId } = getAuth(req);
  if (userId) {
    return {
      role: roles.root,
      userId,
    };
  }

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

  const bearerToken = authHeader.replace(/^Bearer/, "");
  const hash = hashToken(bearerToken);

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

  return {
    role: Role.fromString<Statements>(token.permissions),
    userId: token.userId,
  };
}
