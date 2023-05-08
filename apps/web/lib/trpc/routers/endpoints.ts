import { newId } from "@planetfall/id";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { auth, t } from "../trpc";
import { db } from "@planetfall/db";
import highstorm from "@highstorm/client";
import {
  statusAssertion,
  serialize as serializeAssertions,
  StatusAssertion,
  Assertion,
  headerAssertion,
  HeaderAssertion,
  deserialize,
} from "@planetfall/assertions";

export const endpointRouter = t.router({
  auditLogs: t.procedure
    .use(auth)
    .input(z.object({ endpointId: z.string() }))
    .query(async ({ ctx, input }) => {
      const endpoint = await db.endpoint.findUnique({
        where: {
          id: input.endpointId,
        },
        include: {
          auditLog: {
            include: { user: true },
          },
          team: {
            include: {
              members: {
                where: {
                  userId: ctx.user.id,
                },
              },
            },
          },
        },
      });

      if (!endpoint?.team.members.some((u) => u.userId === ctx.user.id)) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return endpoint.auditLog;
    }),
  create: t.procedure
    .use(auth)
    .input(
      z.object({
        active: z.boolean(),
        name: z.string(),
        method: z.enum(["POST", "GET", "PUT", "DELETE", "PATCH", "OPTIONS"]),
        url: z.string().url(),
        body: z.string().optional(),
        headers: z.record(z.string()).optional(),
        degradedAfter: z.number().int().optional(),
        timeout: z.number().int(),
        interval: z.number().int().positive(),
        regionIds: z.array(z.string()).min(1),
        distribution: z.enum(["ALL", "RANDOM"]),
        teamId: z.string(),
        prewarm: z.boolean(),
        followRedirects: z.boolean(),
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
      const team = await db.team.findUnique({
        where: {
          id: input.teamId,
        },
        select: {
          id: true,
          maxTimeout: true,
          maxEndpoints: true,
          slug: true,
          _count: {
            select: {
              endpoints: true,
            },
          },
        },
      });
      if (!team) {
        throw new TRPCError({ code: "NOT_FOUND", message: "team not found" });
      }
      if (team._count.endpoints >= team.maxEndpoints) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have reached your endpoint limit",
        });
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
          active: input.active,
          degradedAfter: input.degradedAfter,
          timeout: input.timeout,
          prewarm: input.prewarm,
          distribution: input.distribution,
          followRedirects: input.followRedirects,
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
          body: input.body || null,
          owner: {
            connect: {
              id: ctx.user.id,
            },
          },
          auditLog: {
            create: {
              id: newId("audit"),
              userId: ctx.user.id,
              message: "Endpoint created",
            },
          },
        },
      });
      highstorm("endpoint.created", {
        event: `${team.slug} created a new endpoint`,
        metadata: {
          actorId: ctx.user.id,
          endpointId: created.id,
        },
      });

      return created;
    }),
  update: t.procedure
    .use(auth)
    .input(
      z.object({
        endpointId: z.string(),
        name: z.string().optional(),
        method: z.enum(["POST", "GET", "PUT", "DELETE", "PATCH"]).optional(),
        url: z.string().url().optional(),
        body: z.string().nullish().optional(),
        headers: z.record(z.string()).optional(),
        degradedAfter: z.number().int().optional(),
        followRedirects: z.boolean().optional(),
        timeout: z.number().int().optional(),
        interval: z.number().int().positive().optional(),
        regionIds: z.array(z.string()).min(1).optional(),
        distribution: z.enum(["ALL", "RANDOM"]).optional(),
        statusAssertions: z.array(statusAssertion).optional(),
        headerAssertions: z.array(headerAssertion).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const endpoint = await db.endpoint.findUnique({
        where: { id: input.endpointId },
        include: { team: { include: { members: true } } },
      });
      if (!endpoint || endpoint.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "endpoint not found",
        });
      }

      if (!endpoint.team.members.some((m) => m.userId === ctx.user!.id)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      const assertions: Assertion[] = [];
      const existingAssertions = endpoint.assertions ? deserialize(endpoint.assertions) : [];

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
          updatedAt: new Date(),
          method: input.method,
          name: input.name,
          url: input.url,
          interval: input.interval,
          degradedAfter: input.degradedAfter,
          followRedirects: input.followRedirects,
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
          auditLog: {
            create: {
              id: newId("audit"),
              userId: ctx.user.id,
              message: "Endpoint updated",
            },
          },
        },
      });
      highstorm("endpoint.updated", {
        event: `${endpoint.team.slug} updated a new endpoint`,
        metadata: {
          actorId: ctx.user.id,
          endpointId: updatedEndpoint.id,
        },
      });
      return updatedEndpoint;
    }),

  toggleActive: t.procedure
    .use(auth)
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
      const endpoint = await db.endpoint.findUnique({
        where: { id: input.endpointId },
        include: { team: { include: { members: true } } },
      });
      if (!endpoint || endpoint.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "endpoint not found",
        });
      }

      if (!endpoint.team.members.some((m) => m.userId === ctx.user!.id)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      const active = !endpoint.active;
      const updated = await db.endpoint.update({
        where: { id: input.endpointId },
        data: {
          active,
          updatedAt: new Date(),
          auditLog: {
            create: {
              id: newId("audit"),
              userId: ctx.user.id,
              message: active ? "Endpoint enabled" : "Endpoint disabled",
            },
          },
        },
      });
      highstorm("endpoint.updated", {
        event: `${endpoint.team.slug} toggled an endpoint ${active ? "on" : "off"}`,
        metadata: {
          actorId: ctx.user.id,
          endpointId: endpoint.id,
        },
      });
      return updated;
    }),
  delete: t.procedure
    .use(auth)
    .input(
      z.object({
        endpointId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const endpoint = await db.endpoint.findUnique({
        where: { id: input.endpointId },
        include: { team: { include: { members: true } } },
      });
      if (!endpoint || endpoint.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "endpoint not found",
        });
      }

      if (!endpoint.team.members.some((m) => m.userId === ctx.user!.id)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      const deleted = await db.endpoint.update({
        where: { id: input.endpointId },
        data: {
          deletedAt: new Date(),
          auditLog: {
            create: {
              id: newId("audit"),
              userId: ctx.user.id,
              message: "Endpoint deleted",
            },
          },
        },
      });
      highstorm("endpoint.deleted", {
        event: `${endpoint.team.slug} deleted an endpoint`,
        metadata: {
          teamSlug: endpoint.team.slug,
          actorId: ctx.user.id,
          endpointId: deleted.id,
        },
      });
      return deleted;
    }),
});
