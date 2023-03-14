import { db } from "@planetfall/db";
import { Card, Text, Grid, Metric } from "@tremor/react";
import { BarChart, SelectBox, SelectBoxItem } from "./tremor-client";
import { Client as Tinybird } from "@planetfall/tinybird";
import { IndividualUsage } from "./individual-usage";

const tb = new Tinybird();

export default async function AppLayout() {
  const users = await db.user.count();
  const endpoints = await db.endpoint.count();
  const teams = await db.team.findMany();

  const now = new Date();
  const usage = await Promise.all(
    teams.map(async (team) => {
      return {
        team: {
          id: team.id,
          name: team.name,
        },
        usage: await tb.getUsage(team.id, {
          year: now.getUTCFullYear(),
          month: now.getUTCMonth() + 1,
        }),
      };
    }),
  );

  const totalUsage = usage
    .map((u) => ({
      team: u.team,
      "Total Usage": u.usage.reduce((total, day) => total + day.usage, 0),
    }))
    .sort((a, b) => b["Total Usage"] - a["Total Usage"])
    .filter((u) => u["Total Usage"] > 0);

  return (
    <>
      <Grid numColsMd={2} numColsLg={3} className="gap-x-6 gap-y-6 mt-6">
        <Card>
          <Text>Total Teams</Text>
          <Metric>{teams.length}</Metric>
        </Card>
        <Card>
          <Text>Total Users</Text>
          <Metric>{users}</Metric>
        </Card>
        <Card>
          <Text>Total Endpoint</Text>
          <Metric>{endpoints}</Metric>
        </Card>
      </Grid>

      <div className="mt-6">
        <Card>
          <BarChart
            colors={["blue"]}
            data={totalUsage}
            index="team.name"
            categories={["Total Usage"]}
          />
        </Card>
      </div>
      <div className="mt-6">
        <Card>
          <IndividualUsage
            usage={usage.filter(({ team }) => totalUsage.find((t) => t.team.id === team.id))}
          />
        </Card>
      </div>
    </>
  );
}
