import { Team, db } from "@planetfall/db";
import { getUsage } from "@planetfall/tinybird";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const key = "744990978068b3f3bfce91053a3a731e08826f92b72837d79e442ea5584f50f3";

const validation = z.object({
  cardKeys: z.array(z.literal("user-teams")),
  customer: z.object({
    email: z.string(),
    externalId: z.string().nullable(),
  }),
});

const fmt = Intl.NumberFormat("en-US", { notation: "compact" }).format;
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers.authorization !== key) {
    res.status(404).end();
    return;
  }
  const validated = validation.safeParse(req.body);

  if (!validated.success) {
    console.error(`Validation Error: ${validated.error.message}`);
    res.status(400);

    res.json({ error: validated.error.message });
    return;
  }

  let teams: Team[] = [];
  if (validated.data.customer.externalId) {
    const memberships =await db.membership.findMany({
      where: {
        userId: validated.data.customer.externalId,
      },
      include: {
        team: true,
      },
    });
    teams = memberships.map((m) => m.team);
  } else {
    const user =await db.user.findUnique({
      where: {
        email: validated.data.customer.email,
      },
      include: {
        teams: {
          include: {
            team: true,
          },
        },
      },
    });
    if (user) {
      teams = user.teams.map((t) => t.team);
    }
  }

  const card = {
    key: "user-teams",
    timeToLiveSeconds: 60,
    components: [] as any,
  };

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  await Promise.all(
    teams.map(async (team) => {
      const usage = await getUsage({
        teamId: team.id,
        year,
        month,
      });
      const totalUsage = usage.data.reduce((sum, day) => sum + day.usage, 0);

      card.components.push(
        {
          componentRow: {
            rowMainContent: [
              {
                componentText: {
                  text: team.slug,
                  textSize: "L",
                },
              },
            ],
            rowAsideContent: [
              {
                componentBadge: {
                  badgeLabel: team.plan,
                  badgeColor:
                    team.plan === "DISABLED"
                      ? "RED"
                      : team.plan === "FREE"
                      ? "GREY"
                      : team.plan === "PRO"
                      ? "BLUE"
                      : "GREEN",
                },
              },
            ],
          },
        },
        {
          componentSpacer: {
            spacerSize: "S",
          },
        },
        {
          componentRow: {
            rowMainContent: [
              {
                componentText: {
                  text: "Usage",
                  textColor: "MUTED",
                  textSize: "S",
                },
              },
            ],
            rowAsideContent: [
              {
                componentText: {
                  text: `${fmt(totalUsage)} / ${fmt(team.maxMonthlyRequests)}`,
                  textColor:
                    totalUsage / team.maxMonthlyRequests >= 1
                      ? "ERROR"
                      : totalUsage / team.maxMonthlyRequests > 0.8
                      ? "WARNING"
                      : "MUTED",
                },
              },
            ],
          },
        },
        {
          componentDivider: {
            dividerSpacingSize: "M",
          },
        },
      );
    }),
  );

  res.json({ cards: [card] });
  res.status(200).end();
}
