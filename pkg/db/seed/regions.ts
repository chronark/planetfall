import { Platform, PrismaClient } from "@prisma/client";

const awsRegions = [
	{
		platform: Platform.aws,
		url: "https://fwvbnvbb6oz2jzgpovm75hb4540twgye.lambda-url.af-south-1.on.aws",
		region: "af-south-1",
		name: "Cape Town, South Africa",
	},
	{
		platform: Platform.aws,
		url: "https://pzfcpsl6rah7ob2qcirdbdwoxi0mprfy.lambda-url.ap-east-1.on.aws",
		region: "ap-east-1",
		name: "Hong Kong",
	},
	{
		platform: Platform.aws,
		url: "https://aedkpukrqw2v2xoxiyxqtw2jye0sxqgj.lambda-url.ap-northeast-1.on.aws",
		region: "ap-northeast-1",
		name: "Tokyo, Japan",
	},
	{
		platform: Platform.aws,
		url: "https://srbdfu4sloqa36m365l2hxj3zy0sfxgd.lambda-url.ap-northeast-2.on.aws",
		region: "ap-northeast-2",
		name: "Seoul, South Korea",
	},
	{
		platform: Platform.aws,
		url: "https://otqwy4ztlzxbfsqblo6aippqne0zsosn.lambda-url.ap-northeast-3.on.aws",
		region: "ap-northeast-3",
		name: "Osaka, Japan",
	},
	{
		platform: Platform.aws,
		url: "https://z3sxifqdguqafynsgno7oszvlu0vmlvj.lambda-url.ap-south-1.on.aws",
		region: "ap-south-1",
		name: "Mumbai, India",
	},
	{
		platform: Platform.aws,
		url: "https://x7gipm6xm43azjux7pocbauzde0sktuf.lambda-url.ap-southeast-1.on.aws",
		region: "ap-southeast-1",
		name: "Singapore",
	},
	{
		platform: Platform.aws,
		url: "https://quiz2c6reccroj4nfanpg5ugam0bwkjn.lambda-url.ap-southeast-2.on.aws",
		region: "ap-southeast-2",
		name: "Sydney, Australia",
	},
	{
		platform: Platform.aws,
		url: "https://yarzmqqceswzdjiumxjhxb6wp40hfmon.lambda-url.ap-southeast-3.on.aws",
		region: "ap-southeast-3",
		name: "Jakarta, Indonesia",
	},
	{
		platform: Platform.aws,
		url: "https://lbmzunimpea2xn6avrxatagc340bhqcz.lambda-url.ca-central-1.on.aws",
		region: "ca-central-1",
		name: "Montreal, Canada",
	},
	{
		platform: Platform.aws,
		url: "https://anurwjl4ys7a4sd5taw2l7yswm0weooh.lambda-url.eu-central-1.on.aws",
		region: "eu-central-1",
		name: "Frankfurt, Germany",
	},
	{
		platform: Platform.aws,
		url: "https://nm5a2nt7arvrdmkpmghsuw6gbm0jmoud.lambda-url.eu-north-1.on.aws",
		region: "eu-north-1",
		name: "Stockholm, Sweden",
	},
	{
		platform: Platform.aws,
		url: "https://emmt56urfbjlcsz7g5pthurwra0dpyyb.lambda-url.eu-south-1.on.aws",
		region: "eu-south-1",
		name: "Milan, Italy",
	},
	{
		platform: Platform.aws,
		url: "https://euyfmjginq73yhz2u2ctkoz2te0vovcl.lambda-url.eu-west-1.on.aws",
		region: "eu-west-1",
		name: "Dublin, Ireland",
	},
	{
		platform: Platform.aws,
		url: "https://x223heggtqzliqdnjf7ptr64qq0yggsb.lambda-url.eu-west-2.on.aws",
		region: "eu-west-2",
		name: "London, UK",
	},
	{
		platform: Platform.aws,
		url: "https://p7jcbz4gj6gy74brseg66gyx3y0mfxqo.lambda-url.eu-west-3.on.aws",
		region: "eu-west-3",
		name: "Paris, France",
	},
	{
		platform: Platform.aws,
		url: "https://ebv5syscefvfqaq27ryuh2bydm0aeuwn.lambda-url.me-south-1.on.aws",
		region: "me-south-1",
		name: "Bahrain",
	},
	{
		platform: Platform.aws,
		url: "https://nqx75bedph5vsytqrywnxotufm0xckzy.lambda-url.sa-east-1.on.aws",
		region: "sa-east-1",
		name: "São Paulo, Brazil",
	},
	{
		platform: Platform.aws,
		url: "https://6dt2klkvdaryvh3pjb4osro4ky0lqtqo.lambda-url.us-east-1.on.aws",
		region: "us-east-1",
		name: "N. Virginia, US",
	},
	{
		platform: Platform.aws,
		url: "https://ydlfvu24gdqqgowde72tt5zjee0zifnt.lambda-url.us-east-2.on.aws",
		region: "us-east-2",
		name: "Ohio, US, ",
	},
	{
		platform: Platform.aws,
		url: "https://dj7qjsq2vjlzyg75zkqogfmwxu0cwcyp.lambda-url.us-west-1.on.aws",
		region: "us-west-1",
		name: "N. California, US",
	},
	{
		platform: Platform.aws,
		url: "https://sqkhjigvvpijz65inuixu6vhum0ppsqp.lambda-url.us-west-2.on.aws",
		region: "us-west-2",
		name: "Oregon, US",
	},
];
const edgeRegions = [
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/arn1",
		region: "arn1",
		name: "Stockholm, Sweden @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/bom1",
		region: "bom1",
		name: "Mumbai, India @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/cdg1",
		region: "cdg1",
		name: "Paris, France @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/cle1",
		region: "cle1",
		name: "Cleveland, US @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/cpt1",
		region: "cpt1",
		name: "Cape Town, South Africa @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/dub1",
		region: "dub1",
		name: "Dublin, Ireland @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/fra1",
		region: "fra1",
		name: "Frankfurt, Germany @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/gru1",
		region: "gru1",
		name: "São Paulo, Brazil @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/hkg1",
		region: "hkg1",
		name: "Hong Kong @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/hnd1",
		region: "hnd1",
		name: "Tokyo, Japan @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/iad1",
		region: "iad1",
		name: "Washington, D.C., US @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/icn1",
		region: "icn1",
		name: "Seoul, South Korea @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/kix1",
		region: "kix1",
		name: "Osaka, Japan @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/lhr1",
		region: "lhr1",
		name: "London, United Kingdom @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/pdx1",
		region: "pdx1",
		name: "Portland, US @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/sfo1",
		region: "sfo1",
		name: "San Francisco, US @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/sin1",
		region: "sin1",
		name: "Singapore @edge",
	},
	{
		platform: Platform.vercelEdge,
		url: "https://planetfall.io/api/v1/edge-ping/syd1",
		region: "syd1",
		name: "Sydney, Australia @edge",
	},
];

const regions = [...edgeRegions, ...awsRegions];

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
