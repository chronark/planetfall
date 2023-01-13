export function address(): string {
	const isVercel = Boolean(
		process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL,
	);

	const protocol = isVercel ? "https" : "http";
	const host = isVercel ? "planetfall.io" : "localhost:3000";

	return `${protocol}://${host}`;
}
