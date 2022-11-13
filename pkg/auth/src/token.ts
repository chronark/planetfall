import { createHash, randomBytes } from "node:crypto";
import baseX from "base-x";

const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function newSessionToken(
	userId: string,
	sessionId: string,
): { token: string; hash: string } {
	const buf = new TextEncoder().encode([userId, sessionId].join(":"));
	const token = ["tkn", baseX(alphabet).encode(buf)].join("_");

	const hash = hashToken(token);

	return { token, hash };
}

export function newToken(): { token: string; hash: string } {
	const token = ["tkn", baseX(alphabet).encode(randomBytes(32))].join("_");

	const hash = hashToken(token);

	return { token, hash };
}

export function hashToken(token: string): string {
	return createHash("sha256").update(token).digest("hex");
}
