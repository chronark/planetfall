import { PrismaClient } from "@prisma/client";

async function main() {
  const db = new PrismaClient();

  await db.check.deleteMany({
    where: {
      time: {
        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  await db.$disconnect();
}

main();
