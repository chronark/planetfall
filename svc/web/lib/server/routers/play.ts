import { newId } from "@planetfall/id";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { t } from "../trpc";
import { db } from "@planetfall/db";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
	redis: Redis.fromEnv(),
	limiter: Ratelimit.fixedWindow(10, "10 s"),
});

export const playRouter = t.router({
	check: t.procedure
		.input(
			z.object({
				method: z.enum(["GET", "POST", "PUT", "DELETE"]),
				url: z.string().url(),
				regionIds: z.array(z.string()).min(1).max(5),
				repeat: z.boolean().optional(),
			}),
		)
		.output(
			z.array(
				z.object({
					region: z.object({
						id: z.string(),
						name: z.string(),
					}),
					checks: z.array(
						z.object({
							id: z.string(),
							latency: z.number().optional(),
							time: z.number(),
							status: z.number(),
							body: z.string(),
							headers: z.record(z.string()),
							timing: z.object({
								dnsStart: z.number(),
								dnsDone: z.number(),
								connectStart: z.number(),
								connectDone: z.number(),
								firstByteStart: z.number(),
								firstByteDone: z.number(),
								tlsHandshakeStart: z.number(),
								tlsHandshakeDone: z.number(),
								transferStart: z.number(),
								transferDone: z.number(),
							}),
						}),
					),
				}),
			),
		)
		.mutation(async ({ input, ctx }) => {
			const { success } = await ratelimit.limit("global");
			if (!success) {
				throw new TRPCError({
					code: "TOO_MANY_REQUESTS",
					message: "Too many requests, please try again later",
				});
			}

			return await Promise.all(
				input.regionIds.map(async (regionId) => {
					const region = await db.region.findUnique({
						where: { id: regionId },
					});
					if (!region) {
						throw new TRPCError({
							code: "BAD_REQUEST",
							message: `regionId: ${regionId} not found`,
						});
					}
					const headers = new Headers({
						"Content-Type": "application/json",
					});
					if (region.platform === "fly") {
						headers.set("Fly-Prefer-Region", region.region);
					}

					const res = await fetch(region.url, {
						method: "POST",
						headers,
						body: JSON.stringify({
							url: input.url,
							method: input.method,
							timeout: 2000,
							checks: input.repeat ? 2 : 1,
						}),
					});
					if (res.status !== 200) {
						throw new TRPCError({
							code: "INTERNAL_SERVER_ERROR",
							message: `unable to ping: ${region.id} [${
								res.status
							}]: ${await res.text()}`,
						});
					}

					const checks = (await res.json()) as {
						time: number;
						status: number;
						latency: number;
						body: string;
						headers: Record<string, string>;
						timing: {
							dnsStart: number;
							dnsDone: number;
							connectStart: number;
							connectDone: number;
							firstByteStart: number;
							firstByteDone: number;
							tlsHandshakeStart: number;
							tlsHandshakeDone: number;
							transferStart: number;
							transferDone: number;
						};
					}[];

					return {
						region: {
							id: region.id,
							name: region.name,
						},
						checks: checks.map((c) => ({
							...c,
							id: newId("check"),
						})),
					};
				}),
			);
		}),
});
