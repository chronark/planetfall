import { PrismaClient, Role } from "@prisma/client";

async function main() {
  const userId = "user_2FGNbfMRU4joWXFqD03dzcaMEHI";
  const db = new PrismaClient();
  const team = await db.team.upsert({
    where: {
      id: "seed",
    },
    update: {},
    create: {
      id: "seed",
      stripeCustomerId: "abc",
      name: "chronark-local",
      slug: "chronark-local",
      retention: 10000,
      stripeCurrentBillingPeriodStart: 0,
    },
  });

  await db.user.create({
    data: {
      id: userId,
      teams: {
        connectOrCreate: {
          where: {
            userId_teamId: {
              userId,
              teamId: team.id,
            },
          },

          create: {
            team: {
              connect: {
                id: team.id,
              },
            },
            role: "PERSONAL",
          },
        },
      },
    },
  });

  await db.$disconnect();
}

main();
