import { Platform, PrismaClient } from "@prisma/client";

const regions = [
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
