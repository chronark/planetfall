import { Platform, Prisma, PrismaClient } from "@prisma/client";

const regions = [
  {
    platform: Platform.VERCEL,
    region: "arn1",
    name: "Stockholm, Sweden",
    url: "https://pinger-arn1-planetfall.vercel.app/",
  },
  {
    platform: Platform.VERCEL,
    region: "bom1",
    name: "Mumbai, India",
    url: "https://pinger-bom1-planetfall.vercel.app/",
  },
  {
    platform: Platform.VERCEL,
    region: "cdg1",
    name: "Paris, France",
    url: "https://pinger-cdg1-planetfall.vercel.app/",
  },
  {
    platform: Platform.VERCEL,
    region: "cle1",
    name: "Cleveland, USA",
    url: "https://pinger-cle1-planetfall.vercel.app/",
  },
  {
    platform: Platform.VERCEL,
    region: "cpt1",
    name: "Cape Town, South Africa",
    url: "https://pinger-cpt1-planetfall.vercel.app/",
  },
  {
    platform: Platform.VERCEL,
    region: "dub1",
    name: "Dublin, Ireland",
    url: "https://pinger-dub1-planetfall.vercel.app/",
  },
  {
    platform: Platform.VERCEL,
    region: "fra1",
    name: "Frankfurt, Germany",
    url: "https://pinger-fra1-planetfall.vercel.app/",
  },
  {
    platform: Platform.VERCEL,
    region: "gru1",
    name: "São Paulo, Brazil",
    url: "https://pinger-gru1-planetfall.vercel.app/",
  },
  {
    platform: Platform.VERCEL,
    region: "hkg1",
    name: "Hong Kong",
    url: "https://pinger-hkg1-planetfall.vercel.app/",
  },
  {
    platform: Platform.VERCEL,
    region: "hnd1",
    name: "Tokyo, Japan",
    url: "https://pinger-hnd1-planetfall.vercel.app/",
  },
  {
    platform: Platform.VERCEL,
    region: "iad1",
    name: "Washington, D.C., USA",
    url: "https://pinger-iad1-planetfall.vercel.app/",
  },
  {
    platform: Platform.VERCEL,
    region: "icn1",
    name: "Seoul, South Korea",
    url: "https://pinger-icn1-planetfall.vercel.app/",
  },
  {
    platform: Platform.VERCEL,
    region: "kix1",
    name: "Osaka, Japan",
    url: "https://pinger-kix1-planetfall.vercel.app/",
  },
  {
    platform: Platform.VERCEL,
    region: "lhr1",
    name: "London, United Kingdom",
    url: "https://pinger-lhr1-planetfall.vercel.app/",
  },
  {
    platform: Platform.VERCEL,
    region: "pdx1",
    name: "Portland, USA",
    url: "https://pinger-pdx1-planetfall.vercel.app/",
  },
  {
    platform: Platform.VERCEL,
    region: "sfo1",
    name: "San Francisco, USA",
    url: "https://pinger-sfo1-planetfall.vercel.app/",
  },
  {
    platform: Platform.VERCEL,
    region: "sin1",
    name: "Singapore",
    url: "https://pinger-sin1-planetfall.vercel.app/",
  },
  {
    platform: Platform.VERCEL,
    region: "syd1",
    name: "Sydney, Australia",
    url: "https://pinger-syd1-planetfall.vercel.app/",
  },
];
async function main() {
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
