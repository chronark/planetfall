import ms from "ms";

export type Quota = {
	includedRequests: number;
	maxMonthlyRequests: number;
	maxEndpoints: number;
	maxStatusPages: number;
	maxTimeout: number; // in milliseconds
};

export type Tier = "FREE" | "PRO" | "ENTERPRISE";
export const DEFAULT_QUOTA: Record<Tier, Quota> = {
	FREE: {
		includedRequests: 100_000,
		maxMonthlyRequests: 100_000,
		maxStatusPages: 1,
		maxEndpoints: 5,
		maxTimeout: ms("5s"),
	},
	PRO: {
		includedRequests: 100_000,
		maxMonthlyRequests: 5_000_000,
		maxEndpoints: 20,
		maxStatusPages: 5,
		maxTimeout: ms("5s"),
	},
	ENTERPRISE: {
		includedRequests: 1_000_000,
		maxMonthlyRequests: 100_000_000,
		maxEndpoints: 1_000,
		maxStatusPages: 1_000,
		maxTimeout: ms("30s"),
	},
};
