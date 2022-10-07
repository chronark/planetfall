import type { NextRequest } from "next/server";
import { z } from "zod";

const validation = z.object({
    success: z.number().min(0).max(1),
});

export default async (req: NextRequest) => {
    try {
        const v = validation.safeParse(req.body);
        if (!v.success) {
            console.error(v.error.message)
            return new Response(
                v.error.message,
                { status: 400 },
            );
        }
        if (Math.random() <= v.data.success) {
            return new Response(JSON.stringify({ ok: true }), { status: 200 });
        } else {
            return new Response(
                "test failed",
                { status: 500 },
            );
        }
    } catch (e) {
        const err = e as Error;
        console.error(err);
        return new Response(err.message, { status: 500 });
    }
};

export const config = {
    runtime: "experimental-edge",
};
