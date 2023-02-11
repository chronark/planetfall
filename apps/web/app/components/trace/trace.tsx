export type Timings = {
	dnsStart: number;
	dnsDone: number;
	connectStart: number;
	connectDone: number;
	tlsHandshakeStart: number;
	tlsHandshakeDone: number;
	firstByteStart: number;
	firstByteDone: number;
	transferStart: number;
	transferDone: number;
};

export type TraceProps = {
	timings: Timings;
};

export const Trace: React.FC<TraceProps> = ({ timings }): JSX.Element => {
	const min = Math.min(...Object.values(timings).filter((t) => t > 0));
	const max = Math.max(...Object.values(timings).filter((t) => t > 0));

	function width(start: number, done: number): string {
		const percentage = ((done - start) / (max - min)) * 100;
		if (percentage > 0) {
			return `${percentage}%`;
		}
		return "1%";
	}
	return (
		<div className="flex flex-col w-full gap-4 md:gap-0">
			<div className="flex flex-col w-full py-1 rounded duration-500 md:flex-row md:gap-4 md:items-center hover:bg-zinc-100">
				<div className="flex justify-between w-1/2 text-sm text-zinc-500 whitespace-nowrap ">
					<span>DNS</span>
					<span>
						{(timings.dnsDone - timings.dnsStart).toLocaleString()} ms
					</span>
				</div>
				<div className="flex w-full">
					<div
						style={{
							width: width(timings.dnsStart, timings.dnsDone),
						}}
					>
						<div className="h-1.5 bg-gradient-to-r from-blue-500 to-sky-500 rounded-sm" />
					</div>
				</div>
			</div>

			<div className="flex flex-col w-full py-1 rounded duration-500 md:flex-row md:gap-4 md:items-center hover:bg-zinc-100">
				<div className="flex justify-between w-1/2 text-sm text-zinc-500 whitespace-nowrap ">
					<span>Connection</span>
					<span>
						{(timings.connectDone - timings.connectStart).toLocaleString()} ms
					</span>
				</div>
				<div className="flex w-full">
					<div
						style={{
							width: width(min, timings.connectStart),
						}}
					/>
					<div
						style={{
							width: width(timings.connectStart, timings.connectDone),
						}}
					>
						<div className="h-1.5 bg-gradient-to-r from-blue-500 to-sky-500 rounded-sm" />
					</div>
				</div>
			</div>
			{timings.tlsHandshakeDone > 0 && timings.tlsHandshakeStart > 0 ? (
				<div className="flex flex-col w-full py-1 rounded duration-500 md:flex-row md:gap-4 md:items-center hover:bg-zinc-100">
					<div className="flex justify-between w-1/2 text-sm text-zinc-500 whitespace-nowrap ">
						<span>TLS</span>
						<span>
							{(
								timings.tlsHandshakeDone - timings.tlsHandshakeStart
							).toLocaleString()}{" "}
							ms
						</span>
					</div>
					<div className="flex w-full">
						<div
							style={{
								width: width(min, timings.tlsHandshakeStart),
							}}
						/>
						<div
							style={{
								width: width(
									timings.tlsHandshakeStart,
									timings.tlsHandshakeDone,
								),
							}}
						>
							<div className="h-1.5 bg-gradient-to-r from-blue-500 to-sky-500 rounded-sm" />
						</div>
					</div>
				</div>
			) : null}

			<div className="flex flex-col w-full py-1 rounded duration-500 md:flex-row md:gap-4 md:items-center hover:bg-zinc-100">
				<div className="flex justify-between w-1/2 text-sm text-zinc-500 whitespace-nowrap ">
					<span>TTFB</span>
					<span>
						{(timings.firstByteDone - timings.firstByteStart).toLocaleString()}{" "}
						ms
					</span>
				</div>
				<div className="flex w-full">
					<div
						style={{
							width: width(min, timings.firstByteStart),
						}}
					/>
					<div
						style={{
							width: width(timings.firstByteStart, timings.firstByteDone),
						}}
					>
						<div className="h-1.5 bg-gradient-to-r from-blue-500 to-sky-500 rounded-sm" />
					</div>
				</div>
			</div>

			<div className="flex flex-col w-full py-1 rounded duration-500 md:flex-row md:gap-4 md:items-center hover:bg-zinc-100">
				<div className="flex justify-between w-1/2 text-sm text-zinc-500 whitespace-nowrap ">
					<span>Transfer</span>
					<span>
						{(timings.transferDone - timings.transferStart).toLocaleString()} ms
					</span>
				</div>
				<div className="flex w-full">
					<div
						style={{
							width: width(min, timings.transferStart),
						}}
					/>
					<div
						style={{
							width: width(timings.transferStart, timings.transferDone),
						}}
					>
						<div className="h-1.5 bg-gradient-to-r from-blue-500 to-sky-500 rounded-sm" />
					</div>
				</div>
			</div>
		</div>
	);
};
