import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { auth, t } from "../trpc";

import { getLatestChecks10Minutes } from "@planetfall/tinybird";
export const checksRouter = t.router({
    getLatest: t.procedure.use(auth)
        .meta({
            openapi: {
                method: "GET",
                path: "/v1/endpoints/:endpointId/checks/latest",
                tags: ["endpoints"],
                summary: "Get latest check for endpoint",
            },
        })
        .input(z.object({
            endpointId: z.string().describe("The id of the endpoint"),
            since: z.enum(["10m"]).describe("The time since the last check"),
        }))
        .output(
            z.array(
                z.object({
                    id: z.string(),
                    endpointId: z.string(),
                    latency: z.number().nullable(),
                    status: z.number().nullable(),
                    regionId: z.string(),
                    teamId: z.string(),
                    time: z.number().int(),
                    error: z.string().nullable(),
                    body: z.string().nullable(),
                    headers:z.record(z.string ()).nullable(),
                    timing: z.record(z.number()).nullable(),
                })

            ),
        )
        .query(async ({ ctx, input }) => {


            const access = ctx.auth.policy.validate(
                "endpoint:events:read",
                `${ctx.auth.team.id}::endpoint::${input.endpointId}`,
            );
            if (!access.valid) {
                console.warn(
                    `Team ${ctx.auth.team.id} tried to access endpoint ${input.endpointId} but was denied access: ${access.error}`,
                );
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: access.error
                })
            }




            const res = await getLatestChecks10Minutes({ endpointId: input.endpointId })
            return res.data

        }),

});
