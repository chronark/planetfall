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
	let [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		function onScroll() {
			setScrolled(window.scrollY >= 64);
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
				" transition-all duration-500 -mx-4 lg:mx-0 px-4 lg:px-0 ",
				{
					"sticky z-20 top-0 py-2 lg:py-4 my-2 lg:my-4": props.sticky,
					"bg-white border-b border-zinc-300": scrolled,
					"bg-zinc-50": !scrolled,
				},
			)}
		>
			<div className="container justify-between w-full mx-auto sm:flex sm:items-center">
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
