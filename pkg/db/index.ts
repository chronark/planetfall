export { PrismaClient as EdgeClient } from "@prisma/client/edge";


import { PrismaClient } from '@prisma/client'
export const db = new PrismaClient()