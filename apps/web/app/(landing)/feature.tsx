import type { LucideIcon } from "lucide-react";

import React from "react";

export type FeatureProps = {
	hash: string;
	tag?: string;
	title: string;
	image?: React.ReactNode | string;
	description: string;
	bullets: {
		title: string;
		description: string;
		icon?: LucideIcon;
	}[];
};
export const Feature: React.FC<{ feature: FeatureProps; i: number }> = ({
	feature,
	i,
}) => {
	return (
		<div className="py-24 sm:py-32">
			<div className="relative z-0 flex items-center justify-center flex-1 w-full scale-y-125 isolate" />
			<div className="px-6 mx-auto max-w-7xl lg:px-8">
				<div className="mx-auto max-w-7xl sm:text-center">
					<h2 className="text-lg font-semibold leading-8 tracking-tight text-indigo-400">
						{feature.tag}
					</h2>
					<p className="py-2 text-4xl font-medium tracking-tight text-center text-transparent font-display bg-gradient-to-tr from-zinc-200/50 to-white bg-clip-text md:text-7xl">
						{feature.title}
					</p>
					<p className="mt-6 text-lg leading-8 text-zinc-300">
						{feature.description}
					</p>
				</div>
			</div>
			<div className="relative pt-16 overflow-hidden">
				<div className="px-6 mx-auto max-w-7xl lg:px-8">
					{typeof feature.image === "string" ? (
						<img
							src={feature.image}
							alt="App screenshot"
							className=""
							width={2432}
							height={1442}
						/>
					) : feature.image ? (
						feature.image
					) : null}
				</div>
			</div>
			<div className="px-6 mx-auto mt-16 max-w-7xl sm:mt-20 md:mt-24 lg:px-8">
				<dl className="grid max-w-2xl grid-cols-1 mx-auto text-base leading-7 text-zinc-300 gap-x-6 gap-y-10 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
					{feature.bullets.map((b) => (
						<div key={b.title} className="relative pl-9">
							<dt className="inline font-semibold text-white">
								{b.icon ? (
									<b.icon
										className="absolute w-5 h-5 text-zinc-400 top-1 left-1"
										aria-hidden="true"
									/>
								) : null}
								{b.title}
							</dt>{" "}
							<dd className="inline">{feature.description}</dd>
						</div>
					))}
				</dl>
			</div>
		</div>
	);
};
