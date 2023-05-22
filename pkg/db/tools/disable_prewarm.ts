import { PrismaClient } from "@prisma/client";

async function main() {
  const db = new PrismaClient();

 await db.endpoint.updateMany({
    where: {
      teamId: "team_NszcknrCNzjFgnLvqUCXGR",
    },
    data: {
      prewarm: true,
    },
  });

 await db.$disconnect();
}

main();
