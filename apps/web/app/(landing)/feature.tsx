import classNames from "classnames";

import React from "react";

export type FeatureProps = {
	hash: string;
	title: string;
	image?: React.ReactNode;
	description: string;
	bullets: { title: string; description: string }[];
};
export const Feature: React.FC<{ feature: FeatureProps; i: number }> = ({
	feature,
	i,
}) => {
	return (
		<div
			className="container px-4 mx-auto text-center lg:px-8"
			id={feature.hash}
		>
			{/* <h2 className="text-lg font-semibold text-zinc-600"></h2> */}
			<div className="w-full h-6 max-w-md mx-auto drop-shadow-radiant" />

			<h3 className="py-2 mt-2 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-t from-zinc-100/80 to-white md:text-6xl">
				{feature.title}
			</h3>
			<p className="mx-auto mt-4 text-lg md:mt-8 lg:mt-16 max-w-prose text-zinc-200">
				{feature.description}
			</p>
			<div
				className={classNames(
					"flex flex-col items-center justify-center md:mt-8 lg:mt-16",
					{
						"lg:flex-row": i % 2 === 0,
						"lg:flex-row-reverse": i % 2 === 1,
					},
				)}
			>
				{feature.image ? (
					<div className="z-10 mx-auto border rounded lg:w-3/5 drop-shadow-feature border-zinc-300/20">
						{feature.image}
					</div>
				) : null}

				<div
					className={classNames("grid grid-cols-1 mt-4 lg:gap-8", {
						"lg:w-2/5": feature.image,
					})}
				>
					{feature.bullets.map((b) => {
						return (
							<div
								key={b.title}
								className="group from-zinc-600/50 to-transparent drop-shadow-feature"
							>
								<div
									className={classNames(
										"absolute w-full group-hover:w-2/3  h-px -top-px from-zinc-400/0 via-zinc-400/70 to-zinc-400/0 transition-all duration-1000",
										{
											"lg:bg-gradient-to-r lg:right-8 group-hover:right-4":
												i % 2 === 1,
											"lg:bg-gradient-to-l lg:left-8 group-hover:left-4":
												i % 2 === 0,
										},
									)}
								/>
								<div
									className={classNames(
										"absolute w-full group-hover:w-2/3 h-px -bottom-px from-zinc-400/0 via-zinc-400/70 to-zinc-400/0 transition-all duration-1000",
										{
											"lg:bg-gradient-to-r lg:right-8 group-hover:right-4":
												i % 2 === 0,
											"lg:bg-gradient-to-l lg:left-8 group-hover:left-4":
												i % 2 === 1,
										},
									)}
								/>

								<div
									className={classNames(
										"p-4 from-zinc-300/10  to-zinc-300/0 text-center",
										{
											" lg:bg-gradient-feature-to-r lg:text-left":
												feature.image && i % 2 === 0,
											" lg:bg-gradient-feature-to-l lg:text-right":
												feature.image && i % 2 === 1,
										},
									)}
								>
									<dt className="text-lg font-semibold duration-1000 text-zinc-100 group-hover:text-white">
										{b.title}
									</dt>
									<dd className="mt-1 text-sm text-zinc-300">
										{b.description}
									</dd>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};
