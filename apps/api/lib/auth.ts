import {  NextResponse } from "next/server";
import { Policy } from "@planetfall/policies"
import { kysely } from "./kysely";

export type AuthorizationResponse = {
    error: true,
    res: NextResponse;
    policy?: never
} |
{
    error: false
    res?: never
    policy: Policy
    teamId: string
}


export async function authorize(req: Request): Promise<AuthorizationResponse> {


    let authorization = req.headers.get("authorization");
    if (!authorization) {
        return {
            error: true,
            res: NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
        }
    }
    authorization = authorization.replace("Bearer ", "");

    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(authorization));
    const hash = toBase64(buf);

    const apiKey = await kysely
        .selectFrom("ApiKey")
        .selectAll()
        .where("ApiKey.keyHash", "=", hash)
        .executeTakeFirst();

    if (!apiKey) {
        return { error: true, res: NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
    }


    const policy = Policy.parse(apiKey.policy);

    return {
        error: false,
        policy,
        teamId: apiKey.teamId
    }
}


function toBase64(buffer: ArrayBuffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}