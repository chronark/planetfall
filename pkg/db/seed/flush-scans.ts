import { Check, Platform, Prisma, PrismaClient } from "@prisma/client";

async function main() {
  const db = new PrismaClient();

  let checks: Check[] = [];
  do {
    checks = await db.check.findMany({
      take: 10000,
    });
    console.log(new Date().toLocaleString(), " - Deleting", checks.length);
    await db.check.deleteMany({
      where: {
        id: {
          in: checks.map((c) => c.id),
        },
      },
    });
  } while (checks.length > 0);

  await db.$disconnect();
}

main();
