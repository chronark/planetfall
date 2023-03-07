"use client";

import { Column } from "@ant-design/plots";

type Props = {
  usage: {
    year: number;
    month: number;
    day: number;
    usage: number;
  }[];
};

export const UsageChart: React.FC<Props> = (props) => {
  const data: { time: string; usage: number }[] = [];
  const month = new Date().getUTCMonth();
  const day = new Date();
  day.setUTCDate(1);
  while (day.getUTCMonth() === month) {
    const usage = props.usage.find((u) => {
      return (
        u.year === day.getUTCFullYear() &&
        u.month === day.getUTCMonth() + 1 &&
        u.day === day.getUTCDate()
      );
    });
    data.push({
      time: day.toDateString(),
      usage: usage?.usage ?? 0,
    });
    day.setUTCDate(day.getUTCDate() + 1);
  }

  return (
    <Column
      data={data}
      xField="time"
      yField="usage"
      color={"#3366FF"}
      yAxis={{
        tickCount: 3,
        label: {
          formatter: (v: string) =>
            Intl.NumberFormat(undefined, { notation: "compact" }).format(Number(v)),
        },
      }}
      tooltip={{
        formatter: (datum) => ({
          name: "Requests",
          value: Intl.NumberFormat(undefined, { notation: "compact" }).format(Number(datum.usage)),
        }),
      }}
    />
  );
};
