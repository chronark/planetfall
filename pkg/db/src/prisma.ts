export * from "@prisma/client";
import { PrismaClient } from "@prisma/client";

let cachedPrisma: PrismaClient | undefined = undefined;

let prisma: PrismaClient;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
  prisma.$queryRaw`SET @@boost_cached_queries = true`;
} else {
  if (!cachedPrisma) {
    cachedPrisma = new PrismaClient();
    cachedPrisma.$queryRaw`SET @@boost_cached_queries = true`;
  }
  prisma = cachedPrisma;
}

export const db = prisma;
