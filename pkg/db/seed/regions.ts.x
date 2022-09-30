import {  Prisma, PrismaClient } from "@prisma/client";

const regions = [
  { platform: Platform.VERCEL, region: "arn1", name: "Stockholm, Sweden" },
  { platform: Platform.VERCEL, region: "bom1", name: "Mumbai, India" },
  { platform: Platform.VERCEL, region: "cdg1", name: "Paris, France" },
  { platform: Platform.VERCEL, region: "cle1", name: "Cleveland, USA" },
  {
    platform: Platform.VERCEL,
    region: "cpt1",
    name: "Cape Town, South Africa",
  },
  { platform: Platform.VERCEL, region: "dub1", name: "Dublin, Ireland" },
  { platform: Platform.VERCEL, region: "fra1", name: "Frankfurt, Germany" },
  { platform: Platform.VERCEL, region: "gru1", name: "São Paulo, Brazil" },
  { platform: Platform.VERCEL, region: "hkg1", name: "Hong Kong" },
  { platform: Platform.VERCEL, region: "hnd1", name: "Tokyo, Japan" },
  { platform: Platform.VERCEL, region: "iad1", name: "Washington, D.C., USA" },
  { platform: Platform.VERCEL, region: "icn1", name: "Seoul, South Korea" },
  { platform: Platform.VERCEL, region: "kix1", name: "Osaka, Japan" },
  { platform: Platform.VERCEL, region: "lhr1", name: "London, United Kingdom" },
  { platform: Platform.VERCEL, region: "pdx1", name: "Portland, USA" },
  { platform: Platform.VERCEL, region: "sfo1", name: "San Francisco, USA" },
  { platform: Platform.VERCEL, region: "sin1", name: "Singapore" },
  { platform: Platform.VERCEL, region: "syd1", name: "Sydney, Australia" },
];
async function main() {
  await new PrismaClient().region.createMany({
    data: regions.map((r) => ({
      id: [r.platform, r.region].join(":"),
      platform: r.platform,
      region: r.region,
      name: r.name,
    })),
  });
}

main();
