import { PrismaClient } from "@prisma/client";

async function main() {
  const db = new PrismaClient();

  await db.endpoint.updateMany({
    where: {
      prewarm: true,
    },
    data: {
      prewarm: false,
    },
  });

  await db.$disconnect();
}

main();
