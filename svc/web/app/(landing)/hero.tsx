import React, { useId } from "react";

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
						<stop offset={1} stopColor="##fafafa" stopOpacity={0} />
					</linearGradient>
				</defs>
			</svg>
		</div>
	);
};
export const Hero: React.FC = (): JSX.Element => {
	return (
		<section
			className="relative w-screen mt-16 -pt-16"
			style={{ minHeight: "50vh" }}
		>
			<Rings />

			<div className="relative max-w-6xl min-h-screen px-4 mx-auto sm:px-6">
				<div className="pt-32 md:pt-40">
					<div className="flex flex-col items-center text-center">
						<h1 className="max-w-lg md:max-w-xl lg:max-w-4xl xl:max-w-6xl text-center font-extrabold tracking-[-0.02em] py-4  text-[40px] md:text-6xl lg:text-7xl xl:text-8xl   text-transparent bg-clip-text bg-gradient-to-t from-zinc-100/80  to-white">
							Global Latency Monitoring
						</h1>
						<p className="max-w-lg mt-6 text-lg font-light md:max-w-xl lg:max-w-4xl xl:max-w-6xl text-zinc-300">
							Understand the true performance of your API by monitoring it from around the world.
						</p>
						<div className="max-w-xs mx-auto mt-10 space-y-4 sm:max-w-none sm:inline-flex sm:justify-center sm:space-y-0 sm:space-x-4">
							<div>
								<div className="px-10 py-2 text-gray-900 transition-all duration-1000 border border-white rounded bg-gradient-to-tr drop-shadow-launch from-zinc-100 to-white hover:text-zinc-800">
									Launching soon
								</div>
								{/* <Link href="/auth/sign-in">
                  <div className="inline-flex items-center justify-center w-full px-4 py-3 font-medium leading-snug transition-all duration-300 ease-in-out border rounded shadow-sm hover:cursor-pointer hover:px-6 hover:shadow-lg border-zinc-900 bg-zinc-900 text-zinc-50 hover:bg-zinc-50 hover:text-zinc-900 group">
                    Get Started for free
                  </div>
                </Link> */}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
