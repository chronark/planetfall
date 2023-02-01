import { Platform, PrismaClient } from "@prisma/client";

const awsRegions = [
	{
		platform: Platform.aws,
		url: "https://fwvbnvbb6oz2jzgpovm75hb4540twgye.lambda-url.af-south-1.on.aws",
		region: "af-south-1",
		name: "aws:af-south-1",
	},
	{
		platform: Platform.aws,
		url: "https://pzfcpsl6rah7ob2qcirdbdwoxi0mprfy.lambda-url.ap-east-1.on.aws",
		region: "ap-east-1",
		name: "aws:ap-east-1",
	},
	{
		platform: Platform.aws,
		url: "https://aedkpukrqw2v2xoxiyxqtw2jye0sxqgj.lambda-url.ap-northeast-1.on.aws",
		region: "ap-northeast-1",
		name: "aws:ap-northeast-1",
	},
	{
		platform: Platform.aws,
		url: "https://srbdfu4sloqa36m365l2hxj3zy0sfxgd.lambda-url.ap-northeast-2.on.aws",
		region: "ap-northeast-2",
		name: "aws:ap-northeast-2",
	},
	{
		platform: Platform.aws,
		url: "https://otqwy4ztlzxbfsqblo6aippqne0zsosn.lambda-url.ap-northeast-3.on.aws",
		region: "ap-northeast-3",
		name: "aws:ap-northeast-3",
	},
	{
		platform: Platform.aws,
		url: "https://z3sxifqdguqafynsgno7oszvlu0vmlvj.lambda-url.ap-south-1.on.aws",
		region: "ap-south-1",
		name: "aws:ap-south-1",
	},
	{
		platform: Platform.aws,
		url: "https://x7gipm6xm43azjux7pocbauzde0sktuf.lambda-url.ap-southeast-1.on.aws",
		region: "ap-southeast-1",
		name: "aws:ap-southeast-1",
	},
	{
		platform: Platform.aws,
		url: "https://quiz2c6reccroj4nfanpg5ugam0bwkjn.lambda-url.ap-southeast-2.on.aws",
		region: "ap-southeast-2",
		name: "aws:ap-southeast-2",
	},
	{
		platform: Platform.aws,
		url: "https://yarzmqqceswzdjiumxjhxb6wp40hfmon.lambda-url.ap-southeast-3.on.aws",
		region: "ap-southeast-3",
		name: "aws:ap-southeast-3",
	},
	{
		platform: Platform.aws,
		url: "https://lbmzunimpea2xn6avrxatagc340bhqcz.lambda-url.ca-central-1.on.aws",
		region: "ca-central-1",
		name: "aws:ca-central-1",
	},
	{
		platform: Platform.aws,
		url: "https://anurwjl4ys7a4sd5taw2l7yswm0weooh.lambda-url.eu-central-1.on.aws",
		region: "eu-central-1",
		name: "aws:eu-central-1",
	},
	{
		platform: Platform.aws,
		url: "https://nm5a2nt7arvrdmkpmghsuw6gbm0jmoud.lambda-url.eu-north-1.on.aws",
		region: "eu-north-1",
		name: "aws:eu-north-1",
	},
	{
		platform: Platform.aws,
		url: "https://emmt56urfbjlcsz7g5pthurwra0dpyyb.lambda-url.eu-south-1.on.aws",
		region: "eu-south-1",
		name: "aws:eu-south-1",
	},
	{
		platform: Platform.aws,
		url: "https://euyfmjginq73yhz2u2ctkoz2te0vovcl.lambda-url.eu-west-1.on.aws",
		region: "eu-west-1",
		name: "aws:eu-west-1",
	},
	{
		platform: Platform.aws,
		url: "https://x223heggtqzliqdnjf7ptr64qq0yggsb.lambda-url.eu-west-2.on.aws",
		region: "eu-west-2",
		name: "aws:eu-west-2",
	},
	{
		platform: Platform.aws,
		url: "https://p7jcbz4gj6gy74brseg66gyx3y0mfxqo.lambda-url.eu-west-3.on.aws",
		region: "eu-west-3",
		name: "aws:eu-west-3",
	},
	{
		platform: Platform.aws,
		url: "https://ebv5syscefvfqaq27ryuh2bydm0aeuwn.lambda-url.me-south-1.on.aws",
		region: "me-south-1",
		name: "aws:me-south-1",
	},
	{
		platform: Platform.aws,
		url: "https://nqx75bedph5vsytqrywnxotufm0xckzy.lambda-url.sa-east-1.on.aws",
		region: "sa-east-1",
		name: "aws:sa-east-1",
	},
	{
		platform: Platform.aws,
		url: "https://6dt2klkvdaryvh3pjb4osro4ky0lqtqo.lambda-url.us-east-1.on.aws",
		region: "us-east-1",
		name: "aws:us-east-1",
	},
	{
		platform: Platform.aws,
		url: "https://ydlfvu24gdqqgowde72tt5zjee0zifnt.lambda-url.us-east-2.on.aws",
		region: "us-east-2",
		name: "aws:us-east-2",
	},
	{
		platform: Platform.aws,
		url: "https://dj7qjsq2vjlzyg75zkqogfmwxu0cwcyp.lambda-url.us-west-1.on.aws",
		region: "us-west-1",
		name: "aws:us-west-1",
	},
	{
		platform: Platform.aws,
		url: "https://sqkhjigvvpijz65inuixu6vhum0ppsqp.lambda-url.us-west-2.on.aws",
		region: "us-west-2",
		name: "aws:us-west-2",
	},
];
const edgeRegions = [
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/arn1",
		region: "arn1",
		name: "▲ ℇ Stockholm, Sweden",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/bom1",
		region: "bom1",
		name: "▲ ℇ Mumbai, India",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/cdg1",
		region: "cdg1",
		name: "▲ ℇ Paris, France",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/cle1",
		region: "cle1",
		name: "▲ ℇ Cleveland, USA",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/cpt1",
		region: "cpt1",
		name: "▲ ℇ Cape Town, South Africa",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/dub1",
		region: "dub1",
		name: "▲ ℇ Dublin, Ireland",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/fra1",
		region: "fra1",
		name: "▲ ℇ Frankfurt, Germany",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/gru1",
		region: "gru1",
		name: "▲ ℇ São Paulo, Brazil",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/hkg1",
		region: "hkg1",
		name: "▲ ℇ Hong Kong",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/hnd1",
		region: "hnd1",
		name: "▲ ℇ Tokyo, Japan",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/iad1",
		region: "iad1",
		name: "▲ ℇ Washington, D.C., USA",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/icn1",
		region: "icn1",
		name: "▲ ℇ Seoul, South Korea",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/kix1",
		region: "kix1",
		name: "▲ ℇ Osaka, Japan",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/lhr1",
		region: "lhr1",
		name: "▲ ℇ London, United Kingdom",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/pdx1",
		region: "pdx1",
		name: "▲ ℇ Portland, USA",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/sfo1",
		region: "sfo1",
		name: "▲ ℇ San Francisco, USA",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/sin1",
		region: "sin1",
		name: "▲ ℇ Singapore",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/syd1",
		region: "syd1",
		name: "▲ ℇ Sydney, Australia",
	},
];
const vercelRegions = [
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-arn1.vercel.app/api/v1/ping",
		region: "arn1",
		name: "▲ λ Stockholm, Sweden",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-bom1.vercel.app/api/v1/ping",
		region: "bom1",
		name: "▲ λ Mumbai, India",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-cdg1.vercel.app/api/v1/ping",
		region: "cdg1",
		name: "▲ λ Paris, France",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-cle1.vercel.app/api/v1/ping",
		region: "cle1",
		name: "▲ λ Cleveland, USA",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-cpt1.vercel.app/api/v1/ping",
		region: "cpt1",
		name: "▲ λ Cape Town, South Africa",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-dub1.vercel.app/api/v1/ping",
		region: "dub1",
		name: "▲ λ Dublin, Ireland",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-fra1.vercel.app/api/v1/ping",
		region: "fra1",
		name: "▲ λ Frankfurt, Germany",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-gru1.vercel.app/api/v1/ping",
		region: "gru1",
		name: "▲ λ São Paulo, Brazil",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-hkg1.vercel.app/api/v1/ping",
		region: "hkg1",
		name: "▲ λ Hong Kong",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-hnd1.vercel.app/api/v1/ping",
		region: "hnd1",
		name: "▲ λ Tokyo, Japan",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-iad1.vercel.app/api/v1/ping",
		region: "iad1",
		name: "▲ λ Washington, D.C., USA",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-icn1.vercel.app/api/v1/ping",
		region: "icn1",
		name: "▲ λ Seoul, South Korea",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-kix1.vercel.app/api/v1/ping",
		region: "kix1",
		name: "▲ λ Osaka, Japan",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-lhr1.vercel.app/api/v1/ping",
		region: "lhr1",
		name: "▲ λ London, United Kingdom",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-pdx1.vercel.app/api/v1/ping",
		region: "pdx1",
		name: "▲ λ Portland, USA",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-sfo1.vercel.app/api/v1/ping",
		region: "sfo1",
		name: "▲ λ San Francisco, USA",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-sin1.vercel.app/api/v1/ping",
		region: "sin1",
		name: "▲ λ Singapore",
	},
	{
		platform: Platform.vercel,
		url: "https://planetfall-pinger-serverless-syd1.vercel.app/api/v1/ping",
		region: "syd1",
		name: "▲ λ Sydney, Australia",
	},
];
const flyRegions = [
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/ams",
		region: "ams",
		name: "Amsterdam, Netherlands",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/cdg",
		region: "cdg",
		name: "Paris, France",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/den",
		region: "den",
		name: "Denver, Colorado (US)",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/dfw",
		region: "dfw",
		name: "Dallas, Texas (US)",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/ewr",
		region: "ewr",
		name: "Secaucus, NJ (US)",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/fra",
		region: "fra",
		name: "Frankfurt, Germany",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/gru",
		region: "gru",
		name: "São Paulo",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/hkg",
		region: "hkg",
		name: "Hong Kong, Hong Kong",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/iad",
		region: "iad",
		name: "Ashburn, Virginia (US)",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/jnb",
		region: "jnb",
		name: "Johannesburg, South Africa",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/lax",
		region: "lax",
		name: "Los Angeles, California (US)",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/lhr",
		region: "lhr",
		name: "London, United Kingdom",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/maa",
		region: "maa",
		name: "Chennai (Madras), India",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/mad",
		region: "mad",
		name: "Madrid, Spain",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/mia",
		region: "mia",
		name: "Miami, Florida (US)",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/nrt",
		region: "nrt",
		name: "Tokyo, Japan",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/ord",
		region: "ord",
		name: "Chicago, Illinois (US)",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/otp",
		region: "otp",
		name: "Bucharest, Romania",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/scl",
		region: "scl",
		name: "Santiago, Chile",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/sea",
		region: "sea",
		name: "Seattle, Washington (US)",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/sin",
		region: "sin",
		name: "Singapore",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/sjc",
		region: "sjc",
		name: "Sunnyvale, California (US)",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/syd",
		region: "syd",
		name: "Sydney, Australia",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/waw",
		region: "waw",
		name: "Warsaw, Poland",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/yul",
		region: "yul",
		name: "Montreal, Canada	",
	},
	{
		platform: Platform.fly,
		url: "https://check-runner.fly.dev/ping/yyz",
		region: "yyz",
		name: "Toronto, Canada",
	},
];

const regions = [
	...vercelRegions,
	...flyRegions,
	...edgeRegions,
	...awsRegions,
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
