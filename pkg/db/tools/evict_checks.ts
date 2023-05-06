import { PrismaClient } from "@prisma/client";

async function main() {
  const db = new PrismaClient();

  for (let i = 0; i <= 100; i++) {
    console.time(i.toString());
    const remove = await db.check.findMany({
      where: {
        time: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
      },

      take: 100,
    });
    if (remove.length === 0) {
      break;
    }

    await db.check.deleteMany({
      where: {
        id: {
          in: remove.map(({ id }) => id),
        },
      },
    });

    console.timeEnd(i.toString());
  }

  await db.$disconnect();
}

main();
