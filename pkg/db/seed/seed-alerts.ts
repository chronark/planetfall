import { PrismaClient } from "@prisma/client"
import { newId } from "@planetfall/id"
async function main() {
    const db = new PrismaClient()

    const teams = await db.team.findMany({ include: { endpoints: true, members: { include: { user: true } } } })

    for (const t of teams) {
        const teamOwner = t.members.find(m => m.role === "OWNER")?.user
        if (!teamOwner) {
            throw new Error(`No owner found: ${t.id}`)
        }
        for (const e of t.endpoints) {
            const owner = await db.user.findUnique({ where: { id: e.ownerId ?? teamOwner.id } })
            if (!owner) {
                throw new Error("No owner found")
            }

            await db.emailAlert.create({
                data: {
                    id: newId("alert"),
                    team: {
                        connect: {
                            id: t.id
                        }
                    },
                    endpoint: {
                        connect: {
                            id: e.id
                        }
                    },
                    active: true,
                    email: owner.email
                }
            })
        }
    }

    await db.$disconnect();
}

main();
