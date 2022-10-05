import { Platform, Prisma, PrismaClient } from "@prisma/client";

const regions = [
  {
    platform: Platform.AWS,
    region: "af-south-1",
    name: "Cape Town, Africa",
    "url":
      "https://x6fdggz5ifaousb4tlgzbwo45u0vokwn.lambda-url.af-south-1.on.aws/",
  },
  {
    platform: Platform.AWS,
    region: "ap-east-1",
    name: "Hong Kong",
    "url":
      "https://rwbucbatv2spb2mwyfisu7ogxm0efewh.lambda-url.ap-east-1.on.aws/",
  },
  {
    platform: Platform.AWS,
    region: "ap-northeast-1",
    name: "Tokyo, Japan",
    "url":
      "https://2yyu42wdsqpyxkegmkirbn5tim0fpxmo.lambda-url.ap-northeast-1.on.aws/",
  },
  {
    platform: Platform.AWS,
    region: "ap-northeast-2",
    name: "Seoul, Korea",
    "url":
      "https://nmpz6w4duq3gsl37lyso5dfceu0ndlex.lambda-url.ap-northeast-2.on.aws/",
  },
  {
    platform: Platform.AWS,
    region: "ap-northeast-3",
    name: "Osaka, Japan",
    "url":
      "https://px4gpyh377ksteez5ye7kfbe7u0qpfxh.lambda-url.ap-northeast-3.on.aws/",
  },
  {
    platform: Platform.AWS,
    region: "ap-south-1",
    name: "Mumbai, India",
    "url":
      "https://sqpnqwcpuerj2m5faezcgitqbm0puxsl.lambda-url.ap-south-1.on.aws/",
  },
  {
    platform: Platform.AWS,
    region: "ap-southeast-1",
    name: "Singapore",
    "url":
      "https://qeklmgkz22z243isjjbbndmcru0vrxix.lambda-url.ap-southeast-1.on.aws/",
  },
  {
    platform: Platform.AWS,
    region: "ap-southeast-2",
    name: "Sydney, Australia",
    "url":
      "https://g2rtn22t3np6sl4fpqbdqp6zha0kvtsu.lambda-url.ap-southeast-2.on.aws/",
  },
  {
    platform: Platform.AWS,
    region: "ap-southeast-3",
    name: "Jakarta",
    "url":
      "https://k43vboqhgf7vk33zsvdyic4vgi0lxknx.lambda-url.ap-southeast-3.on.aws/",
  },
  {
    platform: Platform.AWS,
    region: "ca-central-1",
    name: "Canada",
    "url":
      "https://nuthvrtuhjaahllcywmzg252ei0fqfpk.lambda-url.ca-central-1.on.aws/",
  },
  {
    platform: Platform.AWS,
    region: "eu-central-1",
    name: "Frankfurt, Germany",
    "url":
      "https://xticwcfcntqwya3fy233j7uzuu0widcc.lambda-url.eu-central-1.on.aws/",
  },
  {
    platform: Platform.AWS,
    region: "eu-north-1",
    name: "Stockhol, Sweden",
    "url":
      "https://t5vylkp7ce6d27knspr56cfswe0ntzyf.lambda-url.eu-north-1.on.aws/",
  },
  {
    platform: Platform.AWS,
    region: "eu-south-1",
    name: "Milan, Italy",
    "url":
      "https://amz2pnc35yw7w54xwoztopaey40vsjwn.lambda-url.eu-south-1.on.aws/",
  },
  {
    platform: Platform.AWS,
    region: "eu-west-1",
    name: "Ireland",
    "url":
      "https://hp7mjl7zedp47bdwpqukayaova0dyuqi.lambda-url.eu-west-1.on.aws/",
  },
  {
    platform: Platform.AWS,
    region: "eu-west-2",
    name: "London, UK",
    "url":
      "https://w3mktacqok3bgbi4zgg2ot52yq0wsnbr.lambda-url.eu-west-2.on.aws/",
  },
  {
    platform: Platform.AWS,
    region: "eu-west-3",
    name: "Paris, France",
    "url":
      "https://ksxyvtnpgczsoqybh4rm5d6i3i0ptynv.lambda-url.eu-west-3.on.aws/",
  },
  {
    platform: Platform.AWS,
    region: "me-south-1",
    name: "Bahrain",
    "url":
      "https://bm46ktwjudhmykyornhfptdh2e0rwmwc.lambda-url.me-south-1.on.aws/",
  },
  {
    platform: Platform.AWS,
    region: "sa-east-1",
    name: "São Paulo",
    "url":
      "https://b2d4fjp3uytorswkloekpz2ii40zkuyu.lambda-url.sa-east-1.on.aws/",
  },
  {
    platform: Platform.AWS,
    region: "us-east-1",
    name: "N. Virginia, USA",
    "url":
      "https://txh46impuuetoankkwtqnmyeda0orxyn.lambda-url.us-east-1.on.aws/",
  },
  {
    platform: Platform.AWS,
    region: "us-east-2",
    name: "Ohio, USA",
    "url":
      "https://b7cihlu3w3zbixv3bxwhctzism0prhas.lambda-url.us-east-2.on.aws/",
  },
  {
    platform: Platform.AWS,
    region: "us-west-1",
    name: "N. California, USA",
    "url":
      "https://atkyrrb73hwqcjigptvc4py2yy0ddarb.lambda-url.us-west-1.on.aws/",
  },
  {
    platform: Platform.AWS,
    region: "us-west-2",
    name: "Oregon, USA",
    "url":
      "https://5ynyspsd2w4i6rewmlk4o7rhhq0jnvjz.lambda-url.us-west-2.on.aws/",
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
