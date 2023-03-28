"use client";
import { Line } from "@ant-design/plots";

type Props = {
  series: {
    time: number;
    p75: number;
  }[];
};

export const AreaChart: React.FC<Props> = ({ series }) => {
  const filtered = series.filter((s) => s.time >= 0);

  return (
    <div className="h-12">
      <Line
        padding={4}
        autoFit={true}
        data={filtered.map((s) => ({
          time: new Date(s.time).toDateString(),
          p75: s.p75,
        }))}
        yField="p75"
        xField="time"
        smooth={true}
        color={(_datum) => {
          return "#3366FF";
        }}
        xAxis={false}
        yAxis={false}
        lineStyle={{
          lineWidth: 1.5,
        }}
        tooltip={{
          formatter: (datum) => ({
            name: "P75 Latency",
            value: `${datum.p75 >= 0 ? Intl.NumberFormat().format(datum.p75) : "N/A"} ms`,
          }),
        }}
      />
    </div>
  );
};
