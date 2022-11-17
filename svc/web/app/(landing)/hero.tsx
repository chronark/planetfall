"use client";
import React, { useId } from "react";
import { motion } from "framer-motion";

const textVariants = {
	visible: {
		opacity: 1,
		transition: { duration: 0.5, staggerChildren: 0.25, ease: "easeInOut" },
	},
	hidden: { opacity: 0 },
};
const slideUp = {
	visible: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: { duration: 0.85, ease: "easeInOut" },
	},
	hidden: { opacity: 0, scale: 0.95, y: "20" },
};

const fadeIn = {
	visible: {
		opacity: 1,
		transition: { duration: 2, delay: 1, ease: "easeInOut" },
	},
	hidden: { opacity: 0 },
};

const Rings: React.FC = (): JSX.Element => {
	let id = useId();

	return (
		<div className="absolute left-1/2  h-2/3 scale-150  stroke-zinc-300/70 [mask-image:linear-gradient(to_top,white_20%,transparent_75%)] -translate-x-1/2">
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
						<stop stopColor="#fff" />
						<stop offset={1} stopColor="##fafafa" stopOpacity={0} />
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
						<stop stopColor="#fff" />
						<stop offset={1} stopColor="#fafafa" stopOpacity={0} />
					</linearGradient>
				</defs>
			</svg>
		</div>
	);
};

export const Hero: React.FC = (): JSX.Element => {
	return (
		<section
			className="relative w-screen h-screen mt-16 -pt-16"
			style={{ minHeight: "50vh" }}
		>
			<Rings />

			<div className="relative h-full max-w-6xl px-4 mx-auto sm:px-6">
				<div className="h-full pt-32 md:pt-40">
					<motion.div
						initial="hidden"
						animate="visible"
						variants={textVariants}
						className="flex flex-col items-center justify-center text-center h-2/3"
					>
						<motion.h1
							variants={slideUp}
							className="container text-center font-extrabold tracking-[-0.02em] py-4  text-6xl lg:text-8xl   text-transparent bg-clip-text bg-gradient-to-t from-zinc-100/80  to-white"
						>
							Global Latency Monitoring
						</motion.h1>
						<motion.p
							variants={slideUp}
							className="container mt-6 text-lg font-light text-zinc-300"
						>
							Understand the true performance of your API by monitoring it from
							around the world.
						</motion.p>
						<motion.div
							variants={fadeIn}
							className="max-w-xs mx-auto mt-10 space-y-4 sm:max-w-none sm:inline-flex sm:justify-center sm:space-y-0 sm:space-x-4"
						>
							<div className="px-10 py-2 text-gray-900 transition-all duration-1000 border border-white rounded bg-gradient-to-tr drop-shadow-launch from-zinc-100 to-white hover:text-zinc-800">
								Launching soon
							</div>
						</motion.div>
					</motion.div>
				</div>
			</div>
		</section>
	);
};
