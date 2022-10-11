import { Check, Platform, Prisma, PrismaClient } from "@prisma/client";

async function main() {
  const db = new PrismaClient();

  await db.token.create({
    data: {
      id: "tkn_BcbHSssEHNKmisGx6yeZtboZiWk3JGEC4",
      tokenHash:
        "d9a41d589df7e910a6bad5b85c86bd2aa653bd63541dc5bda448dc239c81763c",
      userId: "manual",
      permissions: [{ resource: "checks", actions: ["read"] }],
    },
  });
  await db.$disconnect();
}

main();
