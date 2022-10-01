import { Platform, Prisma, PrismaClient } from "@prisma/client";

const regions = [
  {
    platform: Platform.VERCEL,
    region: "arn1",
    name: "Stockholm, Sweden",
    url: "https://planetfall-pinger-arn1.vercel.app/api/v1/ping",
  },
  {
    platform: Platform.VERCEL,
    region: "bom1",
    name: "Mumbai, India",
    url: "https://planetfall-pinger-bom1.vercel.app/api/v1/ping",
  },
  {
    platform: Platform.VERCEL,
    region: "cdg1",
    name: "Paris, France",
    url: "https://planetfall-pinger-cdg1.vercel.app/api/v1/ping",
  },
  {
    platform: Platform.VERCEL,
    region: "cle1",
    name: "Cleveland, USA",
    url: "https://planetfall-pinger-cle1.vercel.app/api/v1/ping",
  },
  {
    platform: Platform.VERCEL,
    region: "cpt1",
    name: "Cape Town, South Africa",
    url: "https://planetfall-pinger-cpt1.vercel.app/api/v1/ping",
  },
  {
    platform: Platform.VERCEL,
    region: "dub1",
    name: "Dublin, Ireland",
    url: "https://planetfall-pinger-dub1.vercel.app/api/v1/ping",
  },
  {
    platform: Platform.VERCEL,
    region: "fra1",
    name: "Frankfurt, Germany",
    url: "https://planetfall-pinger-fra1.vercel.app/api/v1/ping",
  },
  {
    platform: Platform.VERCEL,
    region: "gru1",
    name: "São Paulo, Brazil",
    url: "https://planetfall-pinger-gru1.vercel.app/api/v1/ping",
  },
  {
    platform: Platform.VERCEL,
    region: "hkg1",
    name: "Hong Kong",
    url: "https://planetfall-pinger-hkg1.vercel.app/api/v1/ping",
  },
  {
    platform: Platform.VERCEL,
    region: "hnd1",
    name: "Tokyo, Japan",
    url: "https://planetfall-pinger-hnd1.vercel.app/api/v1/ping",
  },
  {
    platform: Platform.VERCEL,
    region: "iad1",
    name: "Washington, D.C., USA",
    url: "https://planetfall-pinger-iad1.vercel.app/api/v1/ping",
  },
  {
    platform: Platform.VERCEL,
    region: "icn1",
    name: "Seoul, South Korea",
    url: "https://planetfall-pinger-icn1.vercel.app/api/v1/ping",
  },
  {
    platform: Platform.VERCEL,
    region: "kix1",
    name: "Osaka, Japan",
    url: "https://planetfall-pinger-kix1.vercel.app/api/v1/ping",
  },
  {
    platform: Platform.VERCEL,
    region: "lhr1",
    name: "London, United Kingdom",
    url: "https://planetfall-pinger-lhr1.vercel.app/api/v1/ping",
  },
  {
    platform: Platform.VERCEL,
    region: "pdx1",
    name: "Portland, USA",
    url: "https://planetfall-pinger-pdx1.vercel.app/api/v1/ping",
  },
  {
    platform: Platform.VERCEL,
    region: "sfo1",
    name: "San Francisco, USA",
    url: "https://planetfall-pinger-sfo1.vercel.app/api/v1/ping",
  },
  {
    platform: Platform.VERCEL,
    region: "sin1",
    name: "Singapore",
    url: "https://planetfall-pinger-sin1.vercel.app/api/v1/ping",
  },
  {
    platform: Platform.VERCEL,
    region: "syd1",
    name: "Sydney, Australia",
    url: "https://planetfall-pinger-syd1.vercel.app/api/v1/ping",
  },
];
async function main() {
  await new PrismaClient().region.deleteMany();
  await new PrismaClient().region.createMany({
    data: regions.map((r) => ({
      id: [r.platform, r.region].join(":"),
      platform: r.platform,
      region: r.region,
      name: r.name,
      url: r.url,
    })),
  });
}

main();
