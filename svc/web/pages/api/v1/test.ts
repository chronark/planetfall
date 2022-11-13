import type { NextRequest } from "next/server";

export default async function test(_req: NextRequest) {
	try {
		if (Math.random() <= 0.8) {
			return new Response(JSON.stringify({ ok: true }), { status: 200 });
		} else {
			return new Response("test failed", { status: 500 });
		}
	} catch (e) {
		const err = e as Error;
		console.error(err);
		return new Response(err.message, { status: 500 });
	}
}

export const config = {
	runtime: "experimental-edge",
};
