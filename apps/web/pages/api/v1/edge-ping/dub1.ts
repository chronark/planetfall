// @ts-nocheck
import wasmModule from "./pinger.wasm?module";
import "./performance-polyfill";
import "./wasm_exec.js";
import { NextResponse } from "next/server";
export const config = {
	runtime: "edge",
	regions: ["dub1"],
};

export default async function handler(req) {
	const body = await req.text();
	const go = new Go();

	await WebAssembly.instantiate(wasmModule, go.importObject).then(
		async (wasm) => {
			go.run(wasm);
		},
	);
	const res = await ping(body);

	return NextResponse.json(JSON.parse(res));
}
