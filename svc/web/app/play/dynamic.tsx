"use client";
import { Heading } from "@/components/heading";
import { Loading } from "@/components/loading";
import { PageHeader } from "@/components/page";
import type { Region } from "@planetfall/db";
import { useSearchParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import * as checkApi from "pages/api/v1/checks";
import * as shareApi from "pages/api/v1/play/share";
import { BarChart } from "@tremor/react";
import { Trace } from "@/components/trace";
import { Stats } from "@/components/stats";
import * as Tabs from "@radix-ui/react-tabs";
import Link from "next/link";
import { Logo } from "@/components/logo";
import * as Dialog from "@radix-ui/react-alert-dialog";
import { Transition } from "@headlessui/react";
import classNames from "classnames";
import { Button } from "@/components/button";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import { Chart } from "./[shareId]/chart";
import { Table } from "./[shareId]/table";
import { Details } from "./[shareId]/details";

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

	const [copied, setCopied] = useState(false);

	const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [shareIsLoading, setShareLoading] = useState(false);
	const searchParams = useSearchParams();
	const [checks, setChecks] = useState<checkApi.Output["data"]>(undefined);
	const [shareId, setShareId] = useState<string | null>(null);

	async function runCheck(input: checkApi.Input["body"]): Promise<void> {
		setIsLoading(true);
		const res = await fetch("/api/v1/play", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(input),
		});
		setChecks(((await res.json()) as checkApi.Output).data);
		setIsLoading(false);
	}

	async function share(): Promise<void> {
		// setShareLoading(true);

		const res = await fetch("/api/v1/play/share", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ url: getValues().url, checks }),
		});
		const { data, error } = (await res.json()) as shareApi.Output;
		if (error) {
			alert(error);
		}
		setShareId(data!.id);
		setShareLoading(false);
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
		<>
			<Dialog.Root
				open={!!shareId}
				onOpenChange={() => {
					setShareId(null);
				}}
			>
				<Transition.Root show={!!shareId}>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<Dialog.Overlay
							forceMount={true}
							className="fixed inset-0 z-20 bg-slate-900/50"
						/>
					</Transition.Child>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0 scale-95"
						enterTo="opacity-100 scale-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100 scale-100"
						leaveTo="opacity-0 scale-95"
					>
						<Dialog.Content
							forceMount={true}
							className={classNames(
								"fixed z-50",
								"w-[95vw] max-w-md rounded p-4 md:w-full",
								"top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]",
								"bg-white dark:bg-gray-800",
								"focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75",
							)}
						>
							<Dialog.Title>
								<Heading h3={true}>Do you want to share these results?</Heading>
							</Dialog.Title>
							<Dialog.Description className="p-4">
								<Link
									href={`https://planetfall.io/play/${shareId}`}
									className="flex justify-center px-2 py-1 rounded hover:bg-zinc-50 bg-zinc-100 text-zinc-700 ring-1 ring-zinc-900"
								>
									{`https://planetfall.io/play/${shareId}`}
								</Link>
							</Dialog.Description>

							<div className="flex justify-end pt-4 space-x-2 border-t border-slate-200 ">
								<Dialog.Cancel>
									<Button type="secondary">Close</Button>
								</Dialog.Cancel>
							</div>
						</Dialog.Content>
					</Transition.Child>
				</Transition.Root>
			</Dialog.Root>
			<form onSubmit={handleSubmit(submit)}>
				<header className="fixed top-0 z-50 w-full backdrop-blur">
					<div className="container mx-auto">
						<div className="flex items-center justify-between h-16 md:h-20">
							{/* Site branding */}
							<div className="mr-4 shrink-0">
								{/* Logo */}
								<Link href="/" aria-label="Planetfall">
									<div className="flex items-center gap-2 group ">
										<Logo className="w-10 h-10 duration-500 group-hover:text-zinc-700 text-zinc-900" />
										<span className="text-2xl font-semibold duration-500 group-hover:text-black text-zinc-900">
											Planetfall
										</span>
									</div>
								</Link>
							</div>
							{/* Desktop navigation */}
							<nav className="flex items-center grow">
								<ul className="flex flex-wrap items-center justify-end gap-8 grow">
									<li className="hidden md:block">
										<Link
											className="flex items-center px-3 py-2 font-medium transition duration-150 ease-in-out text-zinc-500 hover:text-zinc-700 lg:px-5"
											href="/docs"
										>
											Docs
										</Link>
									</li>
									<li className="hidden md:block">
										<Link
											className="flex items-center px-3 py-2 font-medium transition duration-150 ease-in-out text-zinc-500 hover:text-zinc-700 lg:px-5"
											href="/home"
										>
											Dashboard
										</Link>
									</li>
									<li>
										<button
											key="submit"
											type="submit"
											disabled={isLoading}
											className="inline-flex items-center justify-center py-2 font-medium leading-snug transition-all duration-300 ease-in-out rounded shadow-sm hover:cursor-pointer whitespace-nowrap md:px-4 md:border border-zinc-900 md:bg-zinc-900 md:text-zinc-50 md:hover:bg-zinc-50 hover:text-zinc-900 group"
										>
											{isLoading ? <Loading /> : "Check"}
										</button>
									</li>
									{checks ? (
										<li>
											<button
												key="share"
												type="button"
												disabled={shareIsLoading}
												onClick={() => share()}
												className="inline-flex items-center justify-center py-2 font-medium leading-snug transition-all duration-300 ease-in-out rounded shadow-sm hover:cursor-pointer whitespace-nowrap md:px-4 md:border border-zinc-900 md:bg-zinc-900 md:text-zinc-50 md:hover:bg-zinc-50 hover:text-zinc-900 group"
											>
												{shareIsLoading ? <Loading /> : "Share"}
											</button>
										</li>
									) : null}
								</ul>
							</nav>
						</div>
					</div>
				</header>
				<div className="container min-h-screen pb-20 mx-auto mt-24 -pt-24">
					{checks ? (
						<div className="pb-32 mb-32 space-y-4 border-b md:space-y-8 lg:space-y-16">
							<PageHeader title={url ?? ""} />

							{checks.length >= 2 ? (
								<>
									<Heading h3={true}>Latency per Region</Heading>
									<Chart checks={checks} />
								</>
							) : null}
							{checks.length >= 2 ? <Table checks={checks} /> : null}
							<div>
								{checks.length >= 2 ? (
									<PageHeader
										title="Details"
										description="A detailed breakdown by region, including the response and a latency trace"
									/>
								) : null}

								<Details checks={checks} />
							</div>
						</div>
					) : null}
					<div>
						<PageHeader
							title="Planetfall Playground"
							description="Enter a URL, method and up to five regions to check the latency of your API"
						/>
						<div className="space-y-8 sm:space-y-5 lg:space-y-24">
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
													<fieldset className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
														{allRegions.map((r) => (
															<button
																type="button"
																key={r.id}
																className={`flex justify-between items-center text-left border border-zinc-300 rounded overflow-hidden  hover:border-zinc-700 ${
																	selectedRegions.includes(r.id)
																		? "border-zinc-900 bg-zinc-50"
																		: "border-zinc-300"
																}`}
																onClick={() => {
																	if (selectedRegions.includes(r.id)) {
																		setSelectedRegions(
																			selectedRegions.filter(
																				(id) => id !== r.id,
																			),
																		);
																	} else {
																		setSelectedRegions([
																			...selectedRegions,
																			r.id,
																		]);
																	}
																}}
															>
																<span className="px-2 py-1 lg:px-4">
																	{r.name}
																</span>
																<span className="inline-flex items-center justify-center w-1/5 h-full px-2 text-xs uppercase border-l bg-zinc-50 border-zinc-300">
																	{r.platform}
																</span>
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
		</>
	);
};
