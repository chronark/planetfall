import { PrismaClient } from "@prisma/client";

async function main() {
  const db = new PrismaClient();

  const regions = await db.region.findMany({
    where: {
      platform: "vercelEdge",
    },
  });

  for (const region of regions) {
    console.log(region.region);
    await db.region.update({
      where: {
        id: region.id,
      },
      data: {
        url: `https://planetfall-edge-runner.vercel.app/api/v1/${region.region}`,
      },
    });
  }

  await db.$disconnect();
}

main();
