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
	let [offset, setOffset] = useState(0);

	useEffect(() => {
		function onScroll() {
			setOffset(window.scrollY);
		}
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", onScroll);
		};
	}, []);
	return (
		<div
			className={classNames(" transition-all duration-500   ", {
				"sticky z-20 top-0 py-2 lg:py-4": props.sticky,
				"bg-white border-b border-zinc-300": offset > 8 * 8,
				"bg-zinc-50": offset <= 8 * 8,
			})}
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
