import { newId } from "@planetfall/id";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { t } from "../trpc";
import { db } from "@planetfall/db";
import {
	statusAssertion,
	serialize as serializeAssertions,
	StatusAssertion,
	Assertion,
	headerAssertion,
	HeaderAssertion,
	deserialize,
} from "@planetfall/assertions";
import { kafka } from "lib/kafka";

export const endpointRouter = t.router({
	create: t.procedure
		.input(
			z.object({
				name: z.string(),
				method: z.enum(["POST", "GET", "PUT", "DELETE"]),
				url: z.string().url(),
				body: z.string().optional(),
				headers: z.record(z.string()).optional(),
				degradedAfter: z.number().int().optional(),
				timeout: z.number().int().optional(),
				interval: z.number().int().positive(),
				regionIds: z.array(z.string()).min(1),
				distribution: z.enum(["ALL", "RANDOM"]),
				teamId: z.string(),
				statusAssertions: z.array(statusAssertion).optional(),
				headerAssertions: z.array(headerAssertion).optional(),
			}),
		)
		.output(
			z.object({
				id: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			if (!ctx.session) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}
			const team = await db.team.findUnique({
				where: {
					id: input.teamId,
				},
			});
			if (!team) {
				throw new TRPCError({ code: "NOT_FOUND", message: "team not found" });
			}

			if (input.timeout && input.timeout > team.maxTimeout) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Requested timeout is higher than your plan allows",
				});
			}

			const assertions: Assertion[] = [];
			for (const a of input.statusAssertions ?? []) {
				assertions.push(new StatusAssertion(a));
			}
			for (const a of input.headerAssertions ?? []) {
				assertions.push(new HeaderAssertion(a));
			}

			const created = await db.endpoint.create({
				data: {
					id: newId("endpoint"),
					method: input.method,
					name: input.name,
					url: input.url,
					interval: input.interval,
					active: true,
					degradedAfter: input.degradedAfter,
					timeout: input.timeout,
					distribution: input.distribution,
					regions: {
						connect: input.regionIds.map((id) => ({ id })),
					},
					assertions: serializeAssertions(assertions),
					team: {
						connect: {
							id: team.id,
						},
					},
					headers: input.headers,
					body: input.body,
				},
			});
			kafka.producer()
				.produce(
					"endpoint.created",
					JSON.stringify({ endpointId: created.id }),
				);

			return created;
		}),
	update: t.procedure
		.input(
			z.object({
				endpointId: z.string(),
				name: z.string().optional(),
				method: z.enum(["POST", "GET", "PUT", "DELETE"]).optional(),
				url: z.string().url().optional(),
				body: z.string().nullish().optional(),
				headers: z.record(z.string()).optional(),
				degradedAfter: z.number().int().optional(),
				timeout: z.number().int().optional(),
				interval: z.number().int().positive().optional(),
				regionIds: z.array(z.string()).min(1).optional(),
				distribution: z.enum(["ALL", "RANDOM"]).optional(),
				statusAssertions: z.array(statusAssertion).optional(),
				headerAssertions: z.array(headerAssertion).optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			if (!ctx.session) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}
			const endpoint = await db.endpoint.findUnique({
				where: { id: input.endpointId },
				include: { team: { include: { members: true } } },
			});
			if (!endpoint) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "endpoint not found",
				});
			}

			if (
				!endpoint.team.members.some((m) => m.userId === ctx.session!.user.id)
			) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
				});
			}

			const assertions: Assertion[] = [];
			const existingAssertions = endpoint.assertions
				? deserialize(endpoint.assertions)
				: [];

			assertions.push(
				...(input.statusAssertions
					? input.statusAssertions.map((a) => new StatusAssertion(a))
					: existingAssertions.filter((a) => a.schema.type === "status")),
			);
			assertions.push(
				...(input.headerAssertions
					? input.headerAssertions.map((a) => new HeaderAssertion(a))
					: existingAssertions.filter((a) => a.schema.type === "header")),
			);

			const updatedEndpoint = await db.endpoint.update({
				where: { id: input.endpointId },
				data: {
					method: input.method,
					name: input.name,
					url: input.url,
					interval: input.interval,
					degradedAfter: input.degradedAfter,
					timeout: input.timeout,
					distribution: input.distribution,
					regions: {
						set: input.regionIds?.map((id) => ({
							id,
						})),
					},
					assertions: serializeAssertions(assertions),

					headers: input.headers,
					body: input.body,
				},
			});

			await kafka
				.producer()
				.produce(
					"endpoint.updated",
					JSON.stringify({ endpointId: endpoint.id }),
				);

			return updatedEndpoint;
		}),

	toggleActive: t.procedure
		.input(
			z.object({
				endpointId: z.string(),
			}),
		)
		.output(
			z.object({
				active: z.boolean(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			if (!ctx.session) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}
			const endpoint = await db.endpoint.findUnique({
				where: { id: input.endpointId },
				include: { team: { include: { members: true } } },
			});
			if (!endpoint) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "endpoint not found",
				});
			}

			if (
				!endpoint.team.members.some((m) => m.userId === ctx.session!.user.id)
			) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
				});
			}

			return await db.endpoint.update({
				where: { id: input.endpointId },
				data: {
					active: !endpoint.active,
				},
			});
		}),
	delete: t.procedure
		.input(
			z.object({
				endpointId: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			if (!ctx.session) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}
			const endpoint = await db.endpoint.findUnique({
				where: { id: input.endpointId },
				include: { team: { include: { members: true } } },
			});
			if (!endpoint) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "endpoint not found",
				});
			}

			if (
				!endpoint.team.members.some((m) => m.userId === ctx.session!.user.id)
			) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
				});
			}

			return await db.endpoint.delete({
				where: { id: input.endpointId },
			});
		}),
});
