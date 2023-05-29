import { db } from "@planetfall/db";
import { Policy } from "@planetfall/policies";
import { TRPCError } from "@trpc/server";
import crypto from "node:crypto";
import { z } from "zod";

import { auth, t } from "../trpc";
import { newId, newSecret } from "@planetfall/id";

export const apikeyRouter = t.router({
  create: t.procedure
    .use(auth)
    .input(
      z.object({
        teamId: z.string(),
        name: z.string(),
        permissions: z.object({
          endpoints: z.union([
            z.literal("*"),
            z.record(
              z.object({
                create: z.boolean(),
                read: z.boolean(),
                update: z.boolean(),
                delete: z.boolean(),
              }),
            ),
          ]),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const team = await db.team.findUnique({
        where: {
          id: input.teamId,
        },
        include: {
          members: true,
        },
      });
      if (!team || !team.members.some((member) => member.userId === ctx.user.id)) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found or you are not a member",
        });
      }
      const endpointRules =
        input.permissions.endpoints === "*"
          ? {
              [`${team.id}::endpoint::*`]: ["create", "read", "update", "delete"],
            }
          : Object.entries(input.permissions.endpoints).reduce((acc, endpoint) => {
              const permissions = Object.entries(endpoint[1])
                .filter(([_action, allowed]) => allowed)
                .map(([action, _allowed]) => action);
              if (permissions.length > 0) {
                acc[`${team.id}::endpoint::${endpoint[0]}`] = permissions;
              }
              return acc;
            }, {} as any);

      console.log("X");
      const policy = new Policy({
        resources: {
          endpoint: endpointRules,
        },
      });
      console.log("Y");

      const apiKey = newSecret("apiKey");

      await db.apiKey.create({
        data: {
          id: newId("apiKeyId"),
          keyHash: crypto.createHash("SHA-256").update(apiKey).digest("base64"),
          firstCharacters: apiKey.substring(0, 11), // prefix + 4 characters
          name: input.name,
          team: {
            connect: {
              id: team.id,
            },
          },
          policy: policy.toString(),
        },
      });
      return { apiKey, root: input.permissions.endpoints === "*" };
    }),
  delete: t.procedure
    .use(auth)
    .input(
      z.object({
        keyId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const key = await db.apiKey.findUnique({
        where: {
          id: input.keyId,
        },
        include: {
          team: {
            include: {
              members: true,
            },
          },
        },
      });

      if (!key || !key.team.members.some((member) => member.userId === ctx.user.id)) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await db.apiKey.delete({
        where: {
          id: key.id,
        },
      });
    }),
});
