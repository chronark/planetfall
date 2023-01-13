"use client";

import classNames from "classnames";
import React, { useEffect, useState } from "react";

export type PageHeaderProps = {
	title: string;
	description?: string | React.ReactNode;
	actions?: React.ReactNode[];
	sticky?: boolean;
};
export const PageHeader: React.FC<PageHeaderProps> = (props): JSX.Element => {
	let [isScrolled, setIsScrolled] = useState(false);
	useEffect(() => {
		function onScroll() {
			setIsScrolled(window.scrollY > 0);
		}
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", onScroll);
		};
	}, []);
	return (
		<div
			className={classNames(
				" transition-all duration-500  bg-white my-5 lg:my-16 ",
				{
					"sticky z-20 top-0 py-2 lg:py-4": props.sticky,
					"bg-white/95 backdrop-blur [@supports(backdrop-filter:blur(0))]:bg-white/75":
						isScrolled,
				},
			)}
		>
			<div className="container w-full mx-auto sm:flex sm:items-center sm:justify-between">
				<div>
					<h1 className="text-4xl font-semibold text-zinc-900">
						{props.title}
					</h1>
					<p className="mt-2 text-sm text-zinc-700">{props.description}</p>
				</div>
				<div className="flex items-center gap-2 mt-3 sm:mt-0 sm:ml-4">
					{props.actions?.map((a, i) => (
						<div key={i}>{a}</div>
					))}
				</div>
			</div>
		</div>
	);
};
export default PageHeader;
