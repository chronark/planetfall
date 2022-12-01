import { Platform, PrismaClient } from "@prisma/client";

const regions = [
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "ams",
		name: "Amsterdam, Netherlands",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "cdg",
		name: "Paris, France",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "den",
		name: "Denver, Colorado (US)",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "dfw",
		name: "Dallas, Texas (US)",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "ewr",
		name: "Secaucus, NJ (US)",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "fra",
		name: "Frankfurt, Germany",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "gru",
		name: "São Paulo",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "hkg",
		name: "Hong Kong, Hong Kong",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "iad",
		name: "Ashburn, Virginia (US)",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "jnb",
		name: "Johannesburg, South Africa",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "lax",
		name: "Los Angeles, California (US)",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "lhr",
		name: "London, United Kingdom",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "maa",
		name: "Chennai (Madras), India",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "mad",
		name: "Madrid, Spain",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "mia",
		name: "Miami, Florida (US)",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "nrt",
		name: "Tokyo, Japan",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "ord",
		name: "Chicago, Illinois (US)",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "otp",
		name: "Bucharest, Romania",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "scl",
		name: "Santiago, Chile",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "sea",
		name: "Seattle, Washington (US)",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "sin",
		name: "Singapore",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "sjc",
		name: "Sunnyvale, California (US)",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "syd",
		name: "Sydney, Australia",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "waw",
		name: "Warsaw, Poland",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
		region: "yul",
		name: "Montreal, Canada	",
	},
	{
		platform: Platform.fly,
		url: "https://planetfall-pinger.fly.dev/",
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
