"use client";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { useSelectedLayoutSegments } from "next/navigation";
import React from "react";

export type Props = {
	teamSlug: string;
	teamSwitcher: React.ReactNode;
};

export const Breadcrumbs: React.FC<Props> = ({ teamSwitcher }) => {
	// const segments = useSelectedLayoutSegments();
	// console.log({ segments })
	return (
		<ul role="list" className="flex items-center">
			<li key="home" className="pr-2">
				<Link
					href="/"
					className="text-slate-900 font-bold hover:text-slate-800"
				>
					<Logo className="w-8 h-8" />
				</Link>
			</li>
			<li key="team">
				<div className="flex items-center">
					<span className="text-slate-400 px-2">/</span>
					<div>{teamSwitcher}</div>
				</div>
			</li>

			{/* {segments.map((s, i) => (
				<li key={s} className="flex items-center ">
					<span className="text-slate-400 px-2">/</span>
					<Link
						href={segments.filter((_, j) => j <= i).join("/")}
						className="px-2 text-sm font-medium text-slate-500 hover:text-slate-700"

					>
						{s}
					</Link>
				</li>
			))} */}
		</ul>
	);
};
