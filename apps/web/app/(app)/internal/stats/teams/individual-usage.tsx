"use client";

import { BarChart, SelectBox, SelectBoxItem } from "@tremor/react";
import { useState } from "react";

type Props = {
  usage: {
    team: {
      id: string;
      name: string;
    };
    usage: {
      teamId: string;
      usage: number;
      year: number;
      month: number;
      day: number;
    }[];
  }[];
};

export const IndividualUsage: React.FC<Props> = (props) => {
  const [selected, setSelected] = useState(props.usage.at(0)?.team?.id);

  console.log({ selected });
  const data: { time: string; usage: number }[] = [];
  const month = new Date().getUTCMonth();
  const day = new Date();
  day.setUTCDate(1);
  console.log(props.usage);
  while (day.getUTCMonth() === month) {
    console.log(props.usage, selected);
    const usage = props.usage
      .find(({ team }) => team.id === selected)
      ?.usage.find(
        (u) =>
          u.year === day.getUTCFullYear() &&
          u.month === day.getUTCMonth() + 1 &&
          u.day === day.getUTCDate(),
      );
    data.push({
      time: day.toDateString(),
      usage: usage?.usage ?? 0,
    });
    day.setUTCDate(day.getUTCDate() + 1);
  }

  return (
    <>
      <SelectBox onValueChange={(teamId) => setSelected(teamId)} defaultValue={selected}>
        {props.usage.map((u) => (
          <SelectBoxItem key={u.team.id} value={u.team.id} text={u.team.name} />
        ))}
      </SelectBox>
      <BarChart colors={["blue"]} data={data} index="time" categories={["usage"]} />
    </>
  );
};
