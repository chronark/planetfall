import { Platform, PrismaClient } from "@prisma/client";

const edgeRegions = [
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/arn1",
		region: "arn1",
		name: "▲ Stockholm, Sweden @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/bom1",
		region: "bom1",
		name: "▲ Mumbai, India @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/cdg1",
		region: "cdg1",
		name: "▲ Paris, France @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/cle1",
		region: "cle1",
		name: "▲ Cleveland, USA @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/cpt1",
		region: "cpt1",
		name: "▲ Cape Town, South Africa @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/dub1",
		region: "dub1",
		name: "▲ Dublin, Ireland @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/fra1",
		region: "fra1",
		name: "▲ Frankfurt, Germany @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/gru1",
		region: "gru1",
		name: "▲ São Paulo, Brazil @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/hkg1",
		region: "hkg1",
		name: "▲ Hong Kong @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/hnd1",
		region: "hnd1",
		name: "▲ Tokyo, Japan @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/iad1",
		region: "iad1",
		name: "▲ Washington, D.C., USA @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/icn1",
		region: "icn1",
		name: "▲ Seoul, South Korea @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/kix1",
		region: "kix1",
		name: "▲ Osaka, Japan @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/lhr1",
		region: "lhr1",
		name: "▲ London, United Kingdom @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/pdx1",
		region: "pdx1",
		name: "▲ Portland, USA @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/sfo1",
		region: "sfo1",
		name: "▲ San Francisco, USA @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/sin1",
		region: "sin1",
		name: "▲ Singapore @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/syd1",
		region: "syd1",
		name: "▲ Sydney, Australia @edge",
	},
];
const vercelRegions = [
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-arn1.vercel.app/api/v1/ping",
		region: "arn1",
		name: "▲ Stockholm, Sweden",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-bom1.vercel.app/api/v1/ping",
		region: "bom1",
		name: "▲ Mumbai, India",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-cdg1.vercel.app/api/v1/ping",
		region: "cdg1",
		name: "▲ Paris, France",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-cle1.vercel.app/api/v1/ping",
		region: "cle1",
		name: "▲ Cleveland, USA",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-cpt1.vercel.app/api/v1/ping",
		region: "cpt1",
		name: "▲ Cape Town, South Africa",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-dub1.vercel.app/api/v1/ping",
		region: "dub1",
		name: "▲ Dublin, Ireland",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-fra1.vercel.app/api/v1/ping",
		region: "fra1",
		name: "▲ Frankfurt, Germany",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-gru1.vercel.app/api/v1/ping",
		region: "gru1",
		name: "▲ São Paulo, Brazil",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-hkg1.vercel.app/api/v1/ping",
		region: "hkg1",
		name: "▲ Hong Kong",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-hnd1.vercel.app/api/v1/ping",
		region: "hnd1",
		name: "▲ Tokyo, Japan",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-iad1.vercel.app/api/v1/ping",
		region: "iad1",
		name: "▲ Washington, D.C., USA",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-icn1.vercel.app/api/v1/ping",
		region: "icn1",
		name: "▲ Seoul, South Korea",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-kix1.vercel.app/api/v1/ping",
		region: "kix1",
		name: "▲ Osaka, Japan",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-lhr1.vercel.app/api/v1/ping",
		region: "lhr1",
		name: "▲ London, United Kingdom",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-pdx1.vercel.app/api/v1/ping",
		region: "pdx1",
		name: "▲ Portland, USA",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-sfo1.vercel.app/api/v1/ping",
		region: "sfo1",
		name: "▲ San Francisco, USA",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-sin1.vercel.app/api/v1/ping",
		region: "sin1",
		name: "▲ Singapore",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-syd1.vercel.app/api/v1/ping",
		region: "syd1",
		name: "▲ Sydney, Australia",
	},
];
const flyRegions = [
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/ams",
		region: "ams",
		name: "Amsterdam, Netherlands",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/cdg",
		region: "cdg",
		name: "Paris, France",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/den",
		region: "den",
		name: "Denver, Colorado (US)",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/dfw",
		region: "dfw",
		name: "Dallas, Texas (US)",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/ewr",
		region: "ewr",
		name: "Secaucus, NJ (US)",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/fra",
		region: "fra",
		name: "Frankfurt, Germany",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/gru",
		region: "gru",
		name: "São Paulo",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/hkg",
		region: "hkg",
		name: "Hong Kong, Hong Kong",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/iad",
		region: "iad",
		name: "Ashburn, Virginia (US)",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/jnb",
		region: "jnb",
		name: "Johannesburg, South Africa",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/lax",
		region: "lax",
		name: "Los Angeles, California (US)",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/lhr",
		region: "lhr",
		name: "London, United Kingdom",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/maa",
		region: "maa",
		name: "Chennai (Madras), India",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/mad",
		region: "mad",
		name: "Madrid, Spain",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/mia",
		region: "mia",
		name: "Miami, Florida (US)",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/nrt",
		region: "nrt",
		name: "Tokyo, Japan",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/ord",
		region: "ord",
		name: "Chicago, Illinois (US)",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/otp",
		region: "otp",
		name: "Bucharest, Romania",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/scl",
		region: "scl",
		name: "Santiago, Chile",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/sea",
		region: "sea",
		name: "Seattle, Washington (US)",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/sin",
		region: "sin",
		name: "Singapore",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/sjc",
		region: "sjc",
		name: "Sunnyvale, California (US)",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/syd",
		region: "syd",
		name: "Sydney, Australia",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/waw",
		region: "waw",
		name: "Warsaw, Poland",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/yul",
		region: "yul",
		name: "Montreal, Canada	",
	},
	{
		platform: Platform.fly,
		url: "https://ping.planetfall.io/ping/yyz",
		region: "yyz",
		name: "Toronto, Canada",
	},
];

const regions = [...vercelRegions, ...flyRegions, ...edgeRegions];

async function main() {
	const db = new PrismaClient();
	for (const r of regions) {
		console.log("Upserting", r.platform, r.region);
		await db.region.upsert({
			where: {
				platform_region: {
					platform: r.platform,
					region: r.region,
				},
			},
			update: {
				platform: r.platform,
				region: r.region,
				name: r.name,
				url: r.url,
			},
			create: {
				id: [r.platform, r.region].join(":"),
				platform: r.platform,
				region: r.region,
				name: r.name,
				url: r.url,
			},
		});
	}

	await db.$disconnect();
}

main();
