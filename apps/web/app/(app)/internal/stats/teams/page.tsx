import { db } from "@planetfall/db";
import { Card, Text, Grid, Metric } from "@tremor/react";
import { getUsage } from "@planetfall/tinybird";
import { AreaChart } from "./tremor-client";

export default async function Page() {
  const users = await db.user.count();
  const endpoints = await db.endpoint.count();
  const teams = await db.team.findMany();

  const now = new Date();
  const usage = await getUsage({
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
  });

  const usageOverTime: Record<string, number | string>[] = [];

  // make a copy instead of referencing the same object
  const day = new Date(now);
  day.setDate(1);

  const activeTeams = teams.filter((t) => usage.data.some((u) => u.teamId === t.id));

  const sums: Record<string, number> = activeTeams.reduce(
    (acc, cur) => ({ ...acc, [cur.slug]: 0 }),
    {},
  );
  while (day.getTime() <= now.getTime()) {
    for (const team of activeTeams) {
      const teamUsage = usage.data.find(
        (u) =>
          u.teamId === team.id &&
          u.year === day.getUTCFullYear() &&
          u.month === day.getUTCMonth() + 1 &&
          u.day === day.getDate(),
      );
      sums[team.slug] += teamUsage?.usage ?? 0;
      usageOverTime.push({
        time: day.toDateString(),
        ...sums,
      });
    }
    day.setDate(day.getDate() + 1);
  }
  // const usageOverTime = usage.data.map(({ teamId, year, month, day, usage }) => {
  //   const team = teams.find((t) => t.id === teamId)?.slug ?? teamId;
  //   return {
  //     time: new Date(year, month - 1, day).toISOString(),
  //     [team]: usage,
  //   };
  // });


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
          <Text>Total Endpoints</Text>
          <Metric>{endpoints}</Metric>
        </Card>
      </Grid>

      <div className="mt-6">
        <Card>
          <AreaChart
            data={usageOverTime}
            index="time"
            // colors={["amber","blue"]}
            categories={teams.map((t) => t.slug)}
          />
        </Card>
      </div>
      <div className="mt-6">
        {/* <Card>
           <IndividualUsage
            usage={usage.data.filter(({ teamId }) => totalUsage.find((t) => t.team.id === teamId))}
          /> 
        </Card> */}
      </div>
    </>
  );
}
