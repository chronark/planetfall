import { Platform, PrismaClient } from "@prisma/client";

const regions = [
	{
		platform: Platform.aws,
		region: "af-south-1",
		name: "Cape Town, Africa",
		url: "https://p7nlv5iezv6ai3t3b4pouiug5e0uvklh.lambda-url.af-south-1.on.aws/",
	},
	{
		platform: Platform.aws,
		region: "ap-east-1",
		name: "Hong Kong",
		url: "https://ztefbvgwtarzn4qudkh7vokmzq0fuekd.lambda-url.ap-east-1.on.aws/",
	},
	{
		platform: Platform.aws,
		region: "ap-northeast-1",
		name: "Tokyo, Japan",
		url: "https://no4irijwql2o2ysa7zkebgt4lm0wfihr.lambda-url.ap-northeast-1.on.aws/",
	},
	{
		platform: Platform.aws,
		region: "ap-northeast-2",
		name: "Seoul, Korea",
		url: "https://jfflnx3hdx4hjn2jl5cdswy5wi0ajcfk.lambda-url.ap-northeast-2.on.aws/",
	},
	{
		platform: Platform.aws,
		region: "ap-northeast-3",
		name: "Osaka, Japan",
		url: "https://gskq2knyovodsf3t2ubfnf7hti0dxkbw.lambda-url.ap-northeast-3.on.aws/",
	},
	{
		platform: Platform.aws,
		region: "ap-south-1",
		name: "Mumbai, India",
		url: "https://ahcm5b53ypfg77j2667llbedc40bahub.lambda-url.ap-south-1.on.aws/",
	},
	{
		platform: Platform.aws,
		region: "ap-southeast-1",
		name: "Singapore",
		url: "https://uwvjal3uxdrbtrrtkxosp5axpy0mgjyc.lambda-url.ap-southeast-1.on.aws/",
	},
	{
		platform: Platform.aws,
		region: "ap-southeast-2",
		name: "Sydney, Australia",
		url: "https://4bfh2z3sw6exjsm2amcp3nvch40nscke.lambda-url.ap-southeast-2.on.aws/",
	},
	{
		platform: Platform.aws,
		region: "ap-southeast-3",
		name: "Jakarta",
		url: "https://hqfgqga43krc2m4ot7m5jj2eja0zmcpb.lambda-url.ap-southeast-3.on.aws/",
	},
	{
		platform: Platform.aws,
		region: "ca-central-1",
		name: "Canada",
		url: "https://fypvfik2n67ieiafpq4tylqtri0qvvyh.lambda-url.ca-central-1.on.aws/",
	},
	{
		platform: Platform.aws,
		region: "eu-central-1",
		name: "Frankfurt, Germany",
		url: "https://vvibbrv6nmwyhhfwngs2wlukfi0vtgnp.lambda-url.eu-central-1.on.aws/",
	},
	{
		platform: Platform.aws,
		region: "eu-north-1",
		name: "Stockholm, Sweden",
		url: "https://gddzyvo2mdyzoa5f54nfsyocqm0wykfc.lambda-url.eu-north-1.on.aws/",
	},
	{
		platform: Platform.aws,
		region: "eu-south-1",
		name: "Milan, Italy",
		url: "https://jd6y5ueqejyreffbpcdbnqmlay0qgnqq.lambda-url.eu-south-1.on.aws/",
	},
	{
		platform: Platform.aws,
		region: "eu-west-1",
		name: "Ireland",
		url: "https://rozaoqmmf5okiquwbcdixqcldu0msxsn.lambda-url.eu-west-1.on.aws/",
	},
	{
		platform: Platform.aws,
		region: "eu-west-2",
		name: "London, UK",
		url: "https://2u4mrpyfuktsmienlqmqzlhoja0biaiz.lambda-url.eu-west-2.on.aws/",
	},
	{
		platform: Platform.aws,
		region: "eu-west-3",
		name: "Paris, France",
		url: "https://3g4nkbom7hatytyblfrfhkilu40hwiao.lambda-url.eu-west-3.on.aws/",
	},
	{
		platform: Platform.aws,
		region: "me-south-1",
		name: "Bahrain",
		url: "https://26ippyjcbmxf3sktuqccgt3bs40gnjvn.lambda-url.me-south-1.on.aws/",
	},
	{
		platform: Platform.aws,
		region: "sa-east-1",
		name: "São Paulo",
		url: "https://j5n2bouekddinsgyr3b2yvrwn40sbtos.lambda-url.sa-east-1.on.aws/",
	},
	{
		platform: Platform.aws,
		region: "us-east-1",
		name: "N. Virginia, USA",
		url: "https://c74bcw6k2kpjozp4jhr6xfjdmm0vgcir.lambda-url.us-east-1.on.aws/",
	},
	{
		platform: Platform.aws,
		region: "us-east-2",
		name: "Ohio, USA",
		url: "https://6yjpno5iwtyz5jtjd4abzth32m0zbwqf.lambda-url.us-east-2.on.aws/",
	},
	{
		platform: Platform.aws,
		region: "us-west-1",
		name: "N. California, USA",
		url: "https://ihgffqposvu7f6tq6ntvmxiqbq0qqior.lambda-url.us-west-1.on.aws/",
	},
	{
		platform: Platform.aws,
		region: "us-west-2",
		name: "Oregon, USA",
		url: "https://cc23mi2oufithyqakehzoxt7le0qjcut.lambda-url.us-west-2.on.aws/",
	},

	{
		platform: Platform.fly,
		region: "ams",
		name: "Amsterdam",
		url: "https://planetfall-ping-ams.fly.dev",
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
