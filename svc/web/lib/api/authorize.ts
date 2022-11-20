import { ApiError } from "./error";
import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@planetfall/db";
import { Role } from "@chronark/access";
import { hashToken, roles, Statements } from "@planetfall/auth";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

export async function getRole(req: NextApiRequest, res: NextApiResponse) {
	const session = await unstable_getServerSession(req, res, authOptions);
	if (session) {
		return {
			role: roles.root,
			userId: session.user.id,
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
