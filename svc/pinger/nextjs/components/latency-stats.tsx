import { Series } from "@lib/types";
import React from "react";

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  return (
    <div className="flex items-center text-sm text-slate-500 space-x-1 whitespace-nowrap">
      <span className="flex-shrink-0 font-semibold">
        {label}:
      </span>
      <span>{value} ms</span>
    </div>
  );
};

export const LatencyStats: React.FC<{ series: Series }> = (
  { series },
): JSX.Element => {
  return (
    <div className="flex flex-1 gap-2 sm:gap-4 xl:gap-6 justify-between flex-wrap md:flex-nowrap">
      <Stat label="min" value={Math.round(series.min)} />
      <Stat label="max" value={Math.round(series.max)} />
      <Stat label="p50" value={Math.round(series.p50)} />
      <Stat label="p95" value={Math.round(series.p95)} />
      <Stat label="p99" value={Math.round(series.p99)} />
    </div>
  );
};
