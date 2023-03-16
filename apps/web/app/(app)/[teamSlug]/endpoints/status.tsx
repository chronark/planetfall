"use client";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/hover-card";
import { Text } from "@/components/text";
import classNames from "classnames";

type Props = {
  status: "healthy" | "stopped" | "error" | "degraded";
  tooltip: string;
};

export const Status: React.FC<Props> = ({ status, tooltip }) => {
  return (
    <HoverCard openDelay={10} closeDelay={10}>
      <HoverCardTrigger>
        <div
          className={classNames("p-px  border rounded-full", {
            "border-emerald-300": status === "healthy",
            "border-zinc-200": status === "stopped",
            "border-amber-300": status === "degraded",
            "border-red-300": status === "error",
          })}
        >
          <div
            className={classNames("w-2 h-2 rounded-full", {
              "bg-emerald-500": status === "healthy",
              "bg-zinc-300": status === "stopped",
              "bg-amber-500": status === "degraded",
              "bg-red-500": status === "error",
            })}
          />
        </div>
      </HoverCardTrigger>
      <HoverCardContent align="start">
        <Text>{tooltip}</Text>
      </HoverCardContent>
    </HoverCard>
  );
};
