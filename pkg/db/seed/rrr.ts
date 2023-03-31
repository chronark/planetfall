import { Platform, PrismaClient } from "@prisma/client";


const regions = [
  "vercelEdge:arn1",
  "vercelEdge:bom1",
  "vercelEdge:cdg1",
  "vercelEdge:cle1",
  "vercelEdge:cpt1",
  "vercelEdge:dub1",
  "vercelEdge:fra1",
  "vercelEdge:gru1",
  "vercelEdge:hkg1",
  "vercelEdge:hnd1",
  "vercelEdge:iad1",
  "vercelEdge:lhr1",
  "vercelEdge:pdx1",
  "vercelEdge:sfo1",
  "vercelEdge:sin1",
  "vercelEdge:syd1",
]

const teamId = "team_NszcknrCNzjFgnLvqUCXGR"
async function main() {
  const db = new PrismaClient();

  const endpoints = await db.endpoint.findMany({
    where: {
      teamId
    }
  })
  for (const e of endpoints) {
    console.log(e)
     await db.endpoint.update({
       where: {
         id: e.id
       },
       data: {
         regions: {
           set: regions.map(id => ({ id }))
         }
       }
     })
  }
  console.log(endpoints.length)

  await db.$disconnect();
}

main();
