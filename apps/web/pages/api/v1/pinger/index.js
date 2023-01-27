import wasmModule from "./pinger.wasm?module";
import "./wasm_exec.js";

export const config = {
	runtime: "edge",
};

export default async function handler(req) {
	// @ts-ignore
	const go = new Go();

	await WebAssembly.instantiate(wasmModule, go.importObject).then((wasm) => {
		go.run(wasm);
	});

	const res = await ping(JSON.stringify(req.body));

	// exports.ping()
	return new NextResponse(res);
}
