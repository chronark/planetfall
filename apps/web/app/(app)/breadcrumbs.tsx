"use client";
import { Logo } from "@/components/logo";
import Link from "next/link";
// import { useSelectedLayoutSegments } from "next/navigation";
import React from "react";

export type Props = {
  teamSwitcher?: React.ReactNode;
  withWordMark?: boolean;
  prefix?: string[];
};

export const Breadcrumbs: React.FC<Props> = ({ teamSwitcher, withWordMark, prefix }) => {
  // const segments = useSelectedLayoutSegments();

  return (
    <ul role="list" className="flex items-center">
      <li key="home" className="">
        <Link href="/" className="flex items-center gap-2 font-bold group text-zinc-900 ">
          <Logo className="w-8 h-8 group-hover:text-black" />
          {withWordMark ? (
            <span className="text-xl font-semibold duration-500 group-hover:text-black ">
              Planetfall
            </span>
          ) : null}
        </Link>
      </li>

      {teamSwitcher ? (
        <li key="team">
          <div className="flex items-center">
            {/* <span className="px-2 text-zinc-400">/</span> */}
            <div>{teamSwitcher}</div>
          </div>
        </li>
      ) : null}
      {prefix?.map((s, i) => (
        <li key={s} className="flex items-center ">
          <span className="px-2 text-zinc-400">/</span>
          <Link
            href={`/${prefix.filter((_, j) => j <= i).join("/")}`}
            className="px-2 text-sm font-medium text-zinc-500 hover:text-zinc-700"
          >
            {s}
          </Link>
        </li>
      ))}
      {/* {segments.map((s, i) => (
				<li key={s} className="flex items-center ">
					<span className="px-2 text-zinc-400">/</span>
					<Link
						href={`/${segments.filter((_, j) => j <= i).join("/")}`}
						className="px-2 text-sm font-medium text-zinc-500 hover:text-zinc-700"
					>
						{s}
					</Link>
				</li>
			))} */}
    </ul>
  );
};
