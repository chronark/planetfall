import {  PrismaClient } from "@prisma/client";

async function main() {
  const db = new PrismaClient();
  
  const oldchecks = await db.check.count({
    where:{
      time: {
        lt: new Date(Date.now()-30*24*60*60*1000)
      }
    }
  })
  console.log({oldchecks})


  await db.$disconnect();
}

main();
