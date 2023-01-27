import { newId } from "@planetfall/id";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { t } from "../trpc";
import { db } from "@planetfall/db";

export const pageRouter = t.router({
	create: t.procedure
		.input(
			z.object({
				name: z.string(),
				slug: z.string(),
				endpointIds: z.array(z.string()).min(1),
				teamId: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			if (!ctx.session) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}
			const team = await db.team.findUnique({
				where: { id: input.teamId },
				include: { members: true },
			});
			if (!team) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "endpoint not found",
				});
			}

			if (!team.members.some((m) => m.userId === ctx.session!.user.id)) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
				});
			}

			const page = await db.statusPage.create({
				data: {
					id: newId("page"),
					name: input.name,
					slug: input.slug,
					teamId: input.teamId,
					endpoints: {
						connect: input.endpointIds.map((id) => ({ id })),
					},
				},
			});
			return page;
		}),
	update: t.procedure
		.input(
			z.object({
				pageId: z.string(),
				name: z.string().optional(),
				slug: z.string().optional(),
				endpointIds: z.array(z.string()).min(1).optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			if (!ctx.session) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}
			const page = await db.statusPage.findUnique({
				where: { id: input.pageId },
				include: { team: { include: { members: true } } },
			});
			if (!page) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "page not found",
				});
			}

			if (!page.team.members.some((m) => m.userId === ctx.session!.user.id)) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
				});
			}

			return await db.statusPage.update({
				where: { id: input.pageId },
				data: {
					name: input.name,
					slug: input.slug,
					endpoints: {
						set: input.endpointIds?.map((id) => ({
							id,
						})),
					},
				},
			});
		}),

	delete: t.procedure
		.input(
			z.object({
				pageId: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			if (!ctx.session) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}
			const page = await db.statusPage.findUnique({
				where: { id: input.pageId },
				include: { team: { include: { members: true } } },
			});
			if (!page) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "page not found",
				});
			}

			if (!page.team.members.some((m) => m.userId === ctx.session!.user.id)) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
				});
			}

			return await db.statusPage.delete({
				where: { id: input.pageId },
			});
		}),
});
