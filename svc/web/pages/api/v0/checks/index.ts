import { Check, PrismaClient } from "@planetfall/db";
import { Permission } from "@planetfall/permissions";
import { NextApiRequest, NextApiResponse } from "next";
import crypto from "node:crypto"
import { z } from "zod";


class ApiError extends Error {
    public readonly status: number
    constructor(opts: { status: number, message: string }) {
        super(opts.message)
        this.status = opts.status
    }
}

const input = z.object({
    method: z.enum(["POST"]),
    headers: z.object({
        "content-type": z.string().refine(h => h === "application/json")
    }),
    body: z.object({
        endpointId: z.string(),
        since: z.number().int().optional()
    })
})


type Res = {
    data: Check[]
    error?: never
} |
{
    data?: never
    error: string
}


export default async function handler(req: NextApiRequest, res: NextApiResponse<Res>): Promise<void> {
    try {


        const authorization = req.headers.authorization
        if (!authorization) {
            throw new ApiError({ status: 401, message: "authorization header is missing" })
        }


        const request = input.safeParse(req)
        if (!request.success) {
            throw new ApiError({ status: 400, message: request.error.message })
        }
        

        const bearerToken = authorization.replace("Bearer ", "")

        console.log({bearerToken})
        const hash = crypto.createHash("sha256").update(bearerToken).digest("base64");
        console.log({hash})
        const db = new PrismaClient()
        const token = await db.token.findUnique({ where: { tokenHash: hash } })

        if (!token) {
            throw new ApiError({ status: 401, message: "invalid token" })
        }
        const permissions = Permission.from(token.permissions)

        if (!permissions.verify({ resource: "checks", action: "read" })) {
            throw new ApiError({ status: 401, message: "not allowed to perform this action" })
        }

        const endpoint = await db.endpoint.findUnique({
            where: { id: request.data.body.endpointId },
            include: {
                team: {
                    include: { members: true }
                }
            }
        })
        if (!endpoint) {
            throw new ApiError({ status: 404, message: "endpoint not found" })
        }

        const user = endpoint.team.members.find(m => m.userId === token.userId)
        if (!user) {
            throw new ApiError({ status: 401, message: "user does not belong to team" })
        }

        const checks = await db.check.findMany({
            where: {
                endpointId: request.data.body.endpointId,
                time: {
                    gte: request.data.body.since ? new Date(request.data.body.since) : undefined
                }
            },
            orderBy: {
                time: "desc"
            },
            take: 1000
        })


        res.json({ data: checks })



    } catch (e) {
        if (e instanceof ApiError) {
            console.error(e.message)
            res.status(e.status).json({ error: e.message })
            return
        }
        res.status(500).json({ error: (e as Error).message })

    }
}