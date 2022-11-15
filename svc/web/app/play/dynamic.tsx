"use client";
import { Heading } from "@/components/heading";
import { Loading } from "@/components/loading";
import { PageHeader } from "@/components/page";
import type { Region } from "@planetfall/db";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Input, Output } from "pages/api/v1/checks";
import { BarChart } from "@tremor/react";
import { Trace } from "@/components/trace";
import { Stats } from "@/components/stats";
import * as Tabs from "@radix-ui/react-tabs";
import Link from "next/link";
import { Logo } from "@/components/logo";

type FormData = {
	url: string;
	method: string;
	regions: string[];

	// "true" |"false"
	repeat: string;
};

type Props = {
	regions: Region[];
};

export const Form: React.FC<Props> = ({ regions: allRegions }): JSX.Element => {
	const {
		register,
		formState: { errors },
		handleSubmit,
		setError,
		setValue,
		getValues,
	} = useForm<FormData>({ reValidateMode: "onSubmit" });

	const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const searchParams = useSearchParams();
	const [checks, setChecks] = useState<Output["data"]>(undefined);

	async function runCheck(input: Input["body"]): Promise<void> {
		setIsLoading(true);
		const res = await fetch("/api/v1/play", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(input),
		});
		setChecks(((await res.json()) as Output).data);
		setIsLoading(false);
	}

	async function submit(data: FormData) {
		if (selectedRegions.length === 0) {
			setError("regions", { message: "Select at least 1 region" });
		}
		await runCheck({
			url: data.url,
			method: data.method as any,
			regionIds: selectedRegions,
			repeat: data.repeat === "true",
		});
	}

	const method = searchParams.get("method");
	const url = searchParams.get("url");
	const regions = searchParams.get("regions");
	const repeat = searchParams.get("repeat");
	useEffect(() => {
		let params = 0;

		if (method && typeof method === "string") {
			setValue("method", method.toUpperCase());
			params++;
		}
		if (url && typeof url === "string") {
			setValue("url", url);
			params++;
		}
		if (regions && typeof regions === "string") {
			setSelectedRegions(regions.split(","));
			params++;
		}
		if (repeat === "true") {
			setValue("repeat", "true");
		}

		if (params === 3) {
			runCheck({
				url: url!,
				method: method as any,
				regionIds: regions!.split(","),
				repeat: repeat === "true",
			});
		}
	}, [method, url, regions, repeat]);

	return (
		<form onSubmit={handleSubmit(submit)}>
			<header className="fixed top-0 z-50 w-full  backdrop-blur">
				<div className="container mx-auto">
					<div className="flex items-center justify-between h-16 md:h-20">
						{/* Site branding */}
						<div className="mr-4 shrink-0">
							{/* Logo */}
							<Link href="/" aria-label="Planetfall">
								<div className="flex items-center gap-2 group ">
									<Logo className="w-10 h-10 group-hover:text-black text-primary-900 duration-500" />
									<span className="text-2xl font-semibold group-hover:text-black text-primary-900 duration-500">
										Planetfall
									</span>
								</div>
							</Link>
						</div>
						{/* Desktop navigation */}
						<nav className="flex items-center grow">
							<ul className="flex flex-wrap items-center justify-end grow gap-8">
								<li className="hidden md:block">
									<Link
										className="flex items-center px-3 py-2 font-medium text-zinc-500 hover:text-zinc-700 lg:px-5 transition duration-150 ease-in-out"
										href="/docs"
									>
										Docs
									</Link>
								</li>
								<li className="hidden md:block">
									<Link
										className="flex items-center px-3 py-2 font-medium text-zinc-500 hover:text-zinc-700 lg:px-5 transition duration-150 ease-in-out"
										href="/home"
									>
										Dashboard
									</Link>
								</li>
								<li>
									<button
										key="submit"
										type="submit"
										className="inline-flex items-center justify-center py-2 font-medium leading-snug rounded transition-all hover:cursor-pointer whitespace-nowrap md:px-4 md:border border-zinc-900 duration-300 ease-in-out md:bg-zinc-900 md:text-zinc-50 md:hover:bg-zinc-50 hover:text-zinc-900  shadow-sm group"
									>
										{isLoading ? <Loading /> : "Check"}
									</button>
								</li>
							</ul>
						</nav>
					</div>
				</div>
			</header>
			<div className="container min-h-screen pb-20 mx-auto mt-24 -pt-24">
				{checks ? (
					<div className="pb-32 mb-32 border-b">
						<PageHeader title={getValues().url} />

						{checks.length >= 2 ? (
							<>
								<Heading h3={true}>Latency per Region</Heading>
								<BarChart
									data={checks.map((r) => {
										const x: Record<string, string | number> = {
											region: r.region.name,
										};
										if (r.checks.length > 1) {
											r.checks = r.checks.sort((a, b) => a.time - b.time);
											x.Cold = r.checks[0].latency!;
											x.Hot = r.checks[1].latency!;
										} else {
											x.Latency = r.checks[0].latency!;
										}
										return x;
									})}
									dataKey="region"
									categories={
										checks && checks.length > 0 && checks[0].checks.length > 1
											? ["Cold", "Hot"]
											: ["Latency"]
									}
									colors={["blue", "red"]}
									valueFormatter={(n: number) => `${n.toLocaleString()} ms`}
								/>
							</>
						) : null}

						<div className="py-4 md:py-8 lg:py-16">
							{checks.length >= 2 ? (
								<PageHeader
									title="Details"
									description="A detailed breakdown by region, including the response and a latency trace"
								/>
							) : null}

							<Tabs.Root defaultValue={checks[0].region.id}>
								<Tabs.List className="flex items-center justify-center space-x-4">
									{checks?.map((r) => (
										<Tabs.Trigger
											key={r.region.id}
											value={r.region.id}
											className="border-b border-transparent text-zinc-700 radix-state-active:text-zinc-900 radix-state-active:border-zinc-800"
										>
											{r.region.name}
										</Tabs.Trigger>
									))}
								</Tabs.List>
								{checks?.map((r) => (
									<Tabs.Content
										key={r.region.id}
										value={r.region.id}
										className="flex flex-col justify-between w-full md:flex-row divide-y md:divide-y-0 "
									>
										{r.checks
											.sort((a, b) => a.time - b.time)
											.map((c, i) => (
												<div
													key={i}
													className={`${
														r.checks.length > 1 ? "w-1/2" : "w-full"
													} p-4 flex flex-col divide-y divide-zinc-200`}
												>
													<div className="flex flex-col items-center justify-between">
														{r.checks.length > 1 ? (
															<>
																<Heading h3={true}>
																	{i === 0 ? "Cold" : "Hot"}
																</Heading>
																<span className="text-sm text-zinc-500">
																	{new Date(c.time).toISOString()}
																</span>
															</>
														) : null}
														<div className="flex">
															<Stats
																label="Latency"
																value={c.latency!.toLocaleString()}
																suffix="ms"
															/>

															<Stats label="Status" value={c.status} />
														</div>
													</div>
													<div className="py-4 md:py-8">
														<Heading h4={true}>Trace</Heading>

														<Trace timings={c.timing} />
													</div>
													<div className="py-4 md:py-8">
														<Heading h4={true}>Response Header</Heading>
														<pre className="p-2 rounded bg-zinc-50">
															{JSON.stringify(c.headers, null, 2)}
														</pre>
													</div>
													<div className="py-4 md:py-8">
														<Heading h4={true}>Response Body</Heading>
														<pre className="p-2 rounded bg-zinc-50">
															{atob(c.body ?? "")}
														</pre>
													</div>
												</div>
											))}
									</Tabs.Content>
								))}
							</Tabs.Root>
						</div>
					</div>
				) : null}
				<div>
					<PageHeader
						title="Planetfall Playground"
						description="Enter a URL, method and up to five regions to check the latency of your API"
					/>
					<div className="space-y-8  sm:space-y-5 lg:space-y-24">
						<div className="space-y-6 sm:space-y-5">
							<div>
								<h3 className="text-lg font-medium leading-6 text-zinc-900">
									URL
								</h3>
								<p className="mt-1 text-sm text-zinc-500">
									Enter the url of your endpoint and select a HTTP method
								</p>
							</div>

							<div className="space-y-6 sm:space-y-5">
								<div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-zinc-200 sm:pt-5">
									<label
										htmlFor="method"
										className="block text-sm font-medium sm:col-span-2 text-zinc-700 sm:mt-px sm:pt-2"
									>
										Method
									</label>
									<div className="mt-1 sm:col-span-4 sm:mt-0">
										<div className="">
											<select
												{...register("method", { required: true })}
												className={
													"transition-all  focus:bg-zinc-50 md:px-4 md:h-12 w-full border-zinc-900 border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:shadow"
												}
											>
												<option value="GET">GET</option>
												<option value="POST">POST</option>
												<option value="PUT">PUT</option>
												<option value="DELETE">DELETE</option>
											</select>
										</div>
									</div>
								</div>
								<div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-zinc-200 sm:pt-5">
									<label
										htmlFor="url"
										className="block text-sm font-medium sm:col-span-2 text-zinc-700 sm:mt-px sm:pt-2"
									>
										URL
									</label>
									<div className="mt-1 sm:col-span-4 sm:mt-0">
										<div className="">
											<input
												type="text"
												{...register("url", {
													required: true,
													validate: (v) =>
														z.string().url().safeParse(v).success,
												})}
												placeholder="https://example.com"
												className={`transition-all  focus:bg-zinc-50 md:px-4 md:h-12  w-full ${
													errors.url ? "border-red-500" : "border-zinc-700"
												} hover:border-zinc-900 focus:border-zinc-900  border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:shadow`}
											/>
										</div>
										{errors.url ? (
											<p className="mt-2 text-sm text-red-500">
												{errors.url.message || "A URL is required"}
											</p>
										) : null}
									</div>
								</div>
							</div>
						</div>

						<div className="space-y-6 sm:space-y-5">
							<div>
								<h3 className="text-lg font-medium leading-6 text-zinc-900">
									Repeat
								</h3>
								<p className="mt-1 text-sm text-zinc-500">
									Send 2 requests to your API in rapid succession to simulate
									cold and hot functions or caches.
								</p>
							</div>

							<div className="space-y-6 sm:space-y-5">
								<div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-zinc-200 sm:pt-5">
									<label
										htmlFor="repeat"
										className="block text-sm font-medium sm:col-span-2 text-zinc-700 sm:mt-px sm:pt-2"
									>
										Repeat
									</label>
									<div className="mt-1 sm:col-span-4 sm:mt-0">
										<div className="">
											<select
												{...register("repeat", { required: false })}
												className={
													"transition-all  focus:bg-zinc-50 md:px-4 md:h-12 w-full border-zinc-900 border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:shadow"
												}
											>
												<option value="false">No</option>
												<option value="true">Yes</option>
											</select>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="pt-8 space-y-6 divide-y divide-zinc-200 sm:space-y-5 sm:pt-10">
							<div>
								<h3 className="text-lg font-medium leading-6 text-zinc-900">
									Regions
								</h3>
								<p className="max-w-2xl mt-1 text-sm text-zinc-500">
									Select the regions from where we should call your API.
								</p>
							</div>
							<div className="space-y-6 divide-y divide-zinc-200 sm:space-y-5">
								<div className="pt-6 sm:pt-5">
									<div role="group" aria-labelledby="label-email">
										<div className="sm:grid sm:items-baseline sm:gap-4">
											<div className="mt-4 sm:col-span-3 sm:mt-0">
												<fieldset className="w-full gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4  lg:grid-cols-6">
													{allRegions.map((r) => (
														<button
															type="button"
															key={r.id}
															className={`text-left border rounded px-2 lg:px-4 py-1 hover:border-zinc-700 ${
																selectedRegions.includes(r.id)
																	? "border-zinc-900 bg-zinc-50"
																	: "border-zinc-300"
															}`}
															onClick={() => {
																if (selectedRegions.includes(r.id)) {
																	setSelectedRegions(
																		selectedRegions.filter((id) => id !== r.id),
																	);
																} else {
																	setSelectedRegions([
																		...selectedRegions,
																		r.id,
																	]);
																}
															}}
														>
															{r.name}
														</button>
													))}
												</fieldset>
												{errors.regions ? (
													<p className="mt-2 text-sm text-red-500">
														{errors.regions.message ||
															"Select at least one region"}
													</p>
												) : null}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</form>
	);
};
