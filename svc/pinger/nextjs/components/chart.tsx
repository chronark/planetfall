import * as HoverCard from "@radix-ui/react-hover-card";
import type { Series } from "@lib/types";
import { clsx } from "clsx";
import React from "react";

export const Chart: React.FC<{ series: Series }> = (
  { series },
): JSX.Element => {
  // localMax is the maximum of all displayed data points
  const max = Math.log10(series.max)
  return (
    <div className="flex space-x-px h-10 items-end">
      {series.data.map(({ ts, latency }, i) => {
        const log = Math.log10(latency) / max * 100
        const height = latency >= 0
          ? Math.max(10, Math.min(100, log))
          : 100;
        const cn = clsx(
          "flex-1 h-full rounded-sm hover:opacity-80 hover:scale-y-125 transition-all duration-300",
          {
            "bg-slate-200": latency < 0,
            "bg-rose-400": latency > 300,
            "bg-orange-300": latency <= 300 && latency > 100,
            "bg-yellow-400": latency <= 100 && latency > 50,
            "bg-emerald-400": latency >= 0 && latency <= 50,
          },
        );
        return (
          <HoverCard.Root openDelay={50} closeDelay={40} key={i}>
            <HoverCard.Trigger
              key={i}
              className={cn}
              style={{
                height: `${height}%`,
              }}
            />{" "}
            <HoverCard.Portal>
              <HoverCard.Content>
                {ts > 0
                  ? (
                    <>
                      <div className="overflow-hidden rounded-sm bg-white px-4 py-5 shadow sm:p-6">
                        <dt className="truncate text-sm font-medium text-slate-500">
                          {new Date(ts).toLocaleString()}
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                          {latency} ms
                        </dd>
                      </div>
                      <HoverCard.Arrow />
                    </>
                  )
                  : null}
              </HoverCard.Content>
            </HoverCard.Portal>
          </HoverCard.Root>
        );
      })}
    </div>
  );
};
