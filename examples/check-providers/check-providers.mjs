import pc from "picocolors";
import csv from "csv-parser";
import { fetch } from "undici";
import { Sema } from "async-sema";
import { resolveCname } from "dns";
import { createReadStream } from "fs";
import { stringify as toCSVString } from "csv-string";

const SOURCE_FILE = process.argv[2];
if (!SOURCE_FILE) {
	console.error(pc.red("Usage: node check-providers.mjs <csv-file>"));
	process.exit(1);
}

const SKIP = process.env.SKIP ?? 0;

async function analyzeHost(url, retry = false) {
	const frameworks = new Set();
	const providers = new Set();

	let res;
	try {
		res = await fetch(url);
	} catch (err) {
		if (!retry) {
			return analyzeHost(url, true);
		}

		// retry
		try {
			res = await fetch(url);
		} catch (err) {
			console.error(
				url,
				pc.red("ERROR"),
				err.message,
				err.cause ? err.cause.message : "",
			);
			return { frameworks, providers };
		}
	}

	let cname;

	try {
		cname = await getCname(url);
	} catch (err) {
		if (!retry) {
			return analyzeHost(url, true);
		}

		console.error(url, pc.red("ERROR"), err.message);
		return { frameworks, providers };
	}

	let body;

	try {
		body = await res.text();
	} catch (err) {
		if (!retry) {
			return analyzeHost(url, true);
		}

		console.error(url, pc.red("ERROR"), err.message);
		return { frameworks, providers };
	}

	if (body.includes('id="challenge-running"')) {
		console.error(url, pc.red("ERROR"), "Cloudflare challenge");
		return { frameworks, providers };
	}

	// frameworks or site builders
	if (body.includes('id="__next"')) {
		frameworks.add("Next.js");
		frameworks.add("React");
	}

	if (body.includes("__remixContext")) {
		frameworks.add("Remix");
		frameworks.add("React");
	}

	if (body.includes('id="___gatsby"')) {
		frameworks.add("Gatsby");
		frameworks.add("React");
	}

	if (body.includes('id="__nuxt"')) {
		frameworks.add("Nuxt.js");
		frameworks.add("Vue");
	}

	if (body.includes("data-wf-site=")) {
		frameworks.add("Webflow");
		providers.add("Webflow");
	}

	if (body.includes("data-stencil-build")) {
		frameworks.add("Stencil");
	}

	if (body.includes("//assets.squarespace.com")) {
		frameworks.add("Squarespace");
		providers.add("Squarespace");
	}

	if (body.includes("/wp-json") || body.includes("/wp-includes/")) {
		frameworks.add("WordPress");
	}

	if (res.headers.has("x-do-app-origin")) {
		frameworks.add("DigitalOcean App Platform");
	}

	if (res.headers.has("x-wix-request-id")) {
		frameworks.add("Wix");
		providers.add("Wix");
	}

	if (body.includes('<meta name=generator content="Hugo')) {
		frameworks.add("Hugo");
	}

	if (body.includes('<div id="svelte">') || body.includes("svelte-")) {
		frameworks.add("Svelte");
	}

	if (body.includes("sveltekit:")) {
		frameworks.add("SvelteKit");
		frameworks.add("Svelte");
	}

	if (res.headers.has("x-shopify-stage")) {
		frameworks.add("Shopify");
		providers.add("Shopify");
	}

	if (body.includes("data-reactroot")) {
		frameworks.add("React");
	}

	if (body.includes('<div id="root">')) {
		frameworks.add("CRA");
	}

	if (res.headers.has("x-bubble-perf")) {
		frameworks.add("Bubble");
		providers.add("Bubble");
	}

	if (body.includes('data-server-rendered="true"')) {
		frameworks.add("Vue SSR");
	}

	if (
		body.includes('<script src="runtime.') &&
		body.includes('<script src="polyfills.')
	) {
		frameworks.add("Angular");
	}

	if (body.includes("data-turbo-track")) {
		frameworks.add("Hotwire Turbo");
	}

	if (/<html([^>]*\bamp\b|[^>]*\u26A1\uFE0F?)[^>]*>/i.test(body)) {
		frameworks.add("AMP");
	}

	if (body.includes('src="https://scripts.swipepages.com')) {
		frameworks.add("Swipe Pages");
		providers.add("Swipe Pages");
	}

	// hosting
	if (
		res.headers.has("x-vercel-id") ||
		"Vercel" === res.headers.get("server")
	) {
		providers.add("Vercel");
	}

	if (res.headers.has("fly-request-id")) {
		providers.add("Fly.io");
	}

	if ((res.headers.get("server") ?? "").includes("deno/")) {
		providers.add("Deno Deploy");
	}

	if (
		res.headers.has("x-ak-protocol") ||
		res.headers.get("server") === "AkamaiGHost" ||
		res.headers.has("x-akamai-transformed")
	) {
		providers.add("Akamai");
	}

	if (
		res.headers.has("x-nf-request-id") ||
		res.headers.get("server") === "Netlify"
	) {
		providers.add("Netlify");
	}

	if (res.headers.has("x-github-request-id")) {
		providers.add("GitHub Pages");
	}

	if (res.headers.get("x-powered-by") === "Express") {
		providers.add("Express");
	}

	if (res.headers.get("server") === "AmazonS3") {
		providers.add("AWS S3");
		providers.add("AWS");
	} else if ((res.headers.get("server") ?? "").includes("nginx")) {
		providers.add("Nginx");
	} else if (res.headers.get("server") === "Apache") {
		providers.add("Apache");
	}

	if (res.headers.has("x-amz-cf-id")) {
		providers.add("AWS CloudFront");
		providers.add("AWS");
	}

	// dynamics 365 commerce
	if (
		res.headers.get("set-cookie")?.includes("msdyn365") ||
		body.includes("_msdyn365")
	) {
		providers.add("Microsoft Dynamics 365 Commerce");
	}

	if (body.includes("demandware.static") || body.includes("demandware.store")) {
		providers.add("Salesforce Commerce Cloud");
	}

	if (res.headers.has("X-MSEdge-Ref")) {
		providers.add("Azure CDN");
		providers.add("Azure");
	}

	if (res.headers.has("cf-ray")) {
		providers.add("Cloudflare");
	}

	if (res.headers.get("via")?.toLowerCase() === "1.1 google") {
		providers.add("Google Cloud");
	}

	if ((res.headers.get("via") ?? "").includes("vegur")) {
		providers.add("Heroku");
	}

	if (cname.includes(".elasticbeanstalk.com")) {
		providers.add("AWS Elastic Beanstalk");
	}

	if ((res.headers.get("x-served-by") ?? "").includes("cache-")) {
		providers.add("Fastly");
	}

	if (res.headers.has("x-envoy-upstream-service-time")) {
		providers.add("Envoy");
	}

	return { frameworks, providers };
}

const sema = new Sema(20);

// csv header
// skip adding the header if we're appending to the file
if (!SKIP) {
	process.stdout.write(
		toCSVString(["URL", "Reported Rank", "Rank in CSV", "Tools", "Providers"]),
	);
}

const stream = createReadStream(SOURCE_FILE).pipe(csv());
let i = 0;

for await (const { origin, rank } of stream) {
	let csvRank = i++;

	if (csvRank < SKIP) {
		continue;
	}

	await sema.acquire();

	analyzeHost(origin).then(({ frameworks, providers }) => {
		process.stdout.write(
			toCSVString([
				origin,
				rank,
				csvRank,
				Array.from(frameworks),
				Array.from(providers),
			]),
		);
		sema.release();
	});
}

function getCname(domain) {
	return new Promise((resolve) => {
		resolveCname(domain, (err, addresses) => {
			if (err) {
				resolve([]);
			} else {
				resolve(addresses[0]);
			}
		});
	});
}
