"use client";
import React, { useId } from "react";

const Rings: React.FC = (): JSX.Element => {
	let id = useId();

	return (
		<div className=" absolute left-1/2  h-2/3 scale-150  stroke-zinc-700/70 [mask-image:linear-gradient(to_top,white_20%,transparent_75%)] -translate-x-1/2">
			{/* Outer ring */}

			<svg
				viewBox="0 0 1026 1026"
				fill="none"
				aria-hidden="true"
				className="inset-0 w-full h-full animate-spin-forward-slow"
			>
				<path
					d="M1025 513c0 282.77-229.23 512-512 512S1 795.77 1 513 230.23 1 513 1s512 229.23 512 512Z"
					stroke="#d4d4d8"
					strokeOpacity="0.7"
				/>
				<path
					d="M513 1025C230.23 1025 1 795.77 1 513"
					stroke={`url(#${id}-gradient-1)`}
					strokeLinecap="round"
				/>
				<defs>
					<linearGradient
						id={`${id}-gradient-1`}
						x1="1"
						y1="513"
						x2="1"
						y2="1025"
						gradientUnits="userSpaceOnUse"
					>
						<stop stopColor="#000" />
						<stop offset={1} stopColor="#121212" stopOpacity={0} />
					</linearGradient>
				</defs>
			</svg>
			{/* Inner ring */}
			<svg
				viewBox="0 0 1026 1026"
				fill="none"
				aria-hidden="true"
				className="absolute inset-0 w-full h-full animate-spin-reverse-slower"
			>
				<path
					d="M913 513c0 220.914-179.086 400-400 400S113 733.914 113 513s179.086-400 400-400 400 179.086 400 400Z"
					stroke="#d4d4d8"
					strokeOpacity="0.7"
				/>
				<path
					d="M913 513c0 220.914-179.086 400-400 400"
					stroke={`url(#${id}-gradient-2)`}
					strokeLinecap="round"
				/>
				<defs>
					<linearGradient
						id={`${id}-gradient-2`}
						x1="913"
						y1="513"
						x2="913"
						y2="913"
						gradientUnits="userSpaceOnUse"
					>
						<stop stopColor="#000" />
						<stop offset={1} stopColor="#121212" stopOpacity={0} />
					</linearGradient>
				</defs>
			</svg>
		</div>
	);
};

export const Hero: React.FC = (): JSX.Element => {
	return (
		<section
			className="w-screen bg-white lg:h-screen bg-gradient-to-t from-white via-zinc-300/50 to-zinc-100/20"
			style={{ minHeight: "50vh" }}
		>
			<Rings />

			<div className="relative h-full max-w-6xl px-4 mx-auto sm:px-6">
				<div className="h-full pt-32 md:pt-40">
					<div className="flex flex-col items-center justify-center text-center h-2/3">
						<h1 className="container text-center font-extrabold tracking-[-0.02em] py-4  text-6xl lg:text-8xl   text-transparent bg-clip-text bg-gradient-to-t from-zinc-900 to-zinc-900/80">
							Global Latency Monitoring
						</h1>
						<p className="container mt-6 text-lg font-light text-zinc-700">
							Understand the true performance of your API by monitoring it from
							around the world.
						</p>
						<div className="max-w-xs mx-auto mt-10 space-y-4 sm:max-w-none sm:inline-flex sm:justify-center sm:space-y-0 sm:space-x-4">
							<div className="px-10 py-2 transition-all duration-1000 border border-black rounded text-zinc-100 bg-gradient-to-tr drop-shadow-launch from-zinc-900 to-black hover:text-zinc-200">
								Launching soon
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
